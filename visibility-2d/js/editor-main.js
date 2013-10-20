/*globals define*/
define([
  'level/level',
  'math/geometry',
  'math/point',
  'math/segment'
], function( Level, Geometry ) {
  'use strict';

  var EPSILON = 1e-6;

  var canvas  = document.getElementById( 'editor-canvas' ),
      context = canvas.getContext( '2d' );

  var level = new Level();

  var data = [];

  var size,
      margin = 20;

  var mouse = {
    x: 0,
    y: 0,

    down: false
  };

  var State = {
    LIGHT:     0,
    DRAW:      1,
    TRANSFORM: 2,
    REMOVE:    3
  };

  var editor = {
    selection: [],
    offsets:   [],

    state: State.LIGHT,

    // Line segment currently being drawn.
    segment: []
  };

  var config = {
    handlerRadius: 6
  };

  // Draw with new level data. Does not change light position.
  function refreshLevel() {
    level.load( size, margin, [], data );
    level.lightPosition( level.light.x, level.light.y );
    level.sweep( Math.PI );
  }

  // Draw with new light position. Defaults to mouse position.
  function refreshLight( x, y ) {
    if ( typeof x === 'undefined' ) { x = mouse.x; }
    if ( typeof y === 'undefined' ) { y = mouse.y; }

    level.lightPosition( x, y );
    level.sweep( Math.PI );
  }

  var running = true;

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function update() {}

  function draw( ctx ) {
    var x0, y0, x1, y1;
    var x, y;

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    level.draw( ctx );
    ctx.stroke();

    // Draw temporary line segment.
    ctx.beginPath();
    if ( editor.segment.length ) {
      ctx.moveTo( editor.segment[0], editor.segment[1] );
      ctx.lineTo( mouse.x, mouse.y );
    }

    ctx.strokeStyle = editor.state === State.REMOVE ? '#f43' : 'white';
    ctx.stroke();


    // Draw light position.
    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc( level.light.x, level.light.y, 5, 0, Geometry.PI2 );
    ctx.fill();

    // Draw light rays.
    ctx.beginPath();
    for ( var i = 0, il = level.output.length; i < il; i += 2 ) {
      x0 = level.output[i].x;
      y0 = level.output[i].y;
      x1 = level.output[ i + 1 ].x;
      y1 = level.output[ i + 1 ].y;

      ctx.moveTo( level.light.x, level.light.y );
      ctx.lineTo( x0, y0 );
      ctx.lineTo( x1, y1 );
      ctx.lineTo( level.light.x, level.light.y );
    }

    ctx.fillStyle = 'rgba(255, 255, 192, 0.4)';
    ctx.fill();

    // Draw line segment handlers.
    if ( editor.state === State.TRANSFORM ) {
      level.segments.forEach(function( segment ) {
        [ segment.start, segment.end ].forEach( function( endpoint ) {
          x = endpoint.x;
          y = endpoint.y;

          ctx.beginPath();
          ctx.arc( x, y, config.handlerRadius, 0, Geometry.PI2 );

          ctx.fillStyle = '#f43';
          ctx.fill();

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'white';
          ctx.stroke();
        });
      });
    }

    // Draw current state.
    ctx.font = 'lighter 2em Helvetica Neue, Helvertica, Arial, sans-serif';
    ctx.fillStyle = 'white';
    var state = (function( stateIndex ) {
      return [ 'LIGHT', 'DRAW', 'TRANSFORM', 'REMOVE' ][ stateIndex ];
    }) ( editor.state );

    ctx.fillText( state, 35, 60 );
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    size = Math.min( canvas.width, canvas.height );

    refreshLevel();
  }

  canvas.addEventListener( 'mousedown', function( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    mouse.down = true;

    if ( editor.state === State.DRAW ||
         editor.state === State.REMOVE ) {
      editor.segment = [ mouse.x, mouse.y ];
    }

    if ( editor.state === State.TRANSFORM ) {
      var x, y;
      var i;
      var handlerRadiusSquared = config.handlerRadius * config.handlerRadius;
      data.forEach(function( segment ) {
        for ( i = 0; i < 2; i++ ) {
          x = segment[ 2 * i ];
          y = segment[ 2 * i + 1 ];

          if ( Geometry.distanceSquared( mouse.x, mouse.y, x, y ) < handlerRadiusSquared ) {
            editor.selection.push( segment );
            editor.offsets.push({
              endpoint: i,
              x: x - mouse.x,
              y: y - mouse.y
            });
          }
        }
      });
    }
  });

  canvas.addEventListener( 'mousemove', function( event ) {
    mouse.x = Geometry.limit( event.pageX, margin + EPSILON, size - margin - EPSILON );
    mouse.y = Geometry.limit( event.pageY, margin + EPSILON, size - margin - EPSILON );

    // Update light position.
    if ( editor.state === State.LIGHT ) {
      refreshLight();
    }

    // Move each selected handler.
    if ( mouse.down && editor.state === State.TRANSFORM ) {
      editor.selection.forEach(function( element, index ) {
        var offset = editor.offsets[ index ];
        var endpoint = offset.endpoint;
        element[ 2 * endpoint ]     = mouse.x + offset.x;
        element[ 2 * endpoint + 1 ] = mouse.y + offset.y;
      });

      refreshLevel();
    }
  });

  canvas.addEventListener( 'mouseup', function( event ) {
    mouse.down = false;

    if ( editor.state === State.DRAW ) {
      data.push(editor.segment.concat([
        mouse.x, mouse.y
      ]));

      editor.segment = [];
      refreshLevel();
    }

    if ( editor.state === State.TRANSFORM ) {
      editor.selection = [];
      editor.offsets = [];
    }

    if ( editor.state === State.REMOVE ) {
      var x0 = editor.segment[0],
          y0 = editor.segment[1],
          x1 = mouse.x,
          y1 = mouse.y;

      // Remove all intersecting line segments.
      data = data.filter(function( segment ) {
        var s = Geometry.lineIntersectionParameter(
          x0, y0,
          x1, y1,
          segment[0], segment[1],
          segment[2], segment[3]
        );

        var t = Geometry.lineIntersectionParameter(
          segment[0], segment[1],
          segment[2], segment[3],
          x0, y0,
          x1, y1
        );

        // No intersection if at least one parameter is a
        // non-null value outside of [0, 1].
        return ( s !== null && ( 0 > s || s > 1 ) ) ||
               ( t !== null && ( 0 > t || t > 1 ) );
      });

      editor.segment = [];
      refreshLevel();
    }
  });

  document.addEventListener( 'keydown', function( event ) {
    if ( mouse.down ) {
      return;
    }

    if ( event.shiftKey ) {
      editor.state = State.TRANSFORM;
    } else if ( event.altKey ) {
      editor.state = State.REMOVE;
    } else if ( event.metaKey ) {
      editor.state = State.DRAW;
    }
  });

  document.addEventListener( 'keyup', function() {
    editor.state = State.LIGHT;
  });

  window.addEventListener( 'resize', resize );

  (function() {
    resize();

    level.light.x = 200;
    level.light.y = 200;

    refreshLevel();
    tick();
  }) ();
});
