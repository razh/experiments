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
    handlerRadius: 5
  };

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

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    level.draw( ctx );

    // Draw temporary line segment.
    if ( editor.segment.length ) {
      ctx.moveTo( editor.segment[0], editor.segment[1] );
      ctx.lineTo( mouse.x, mouse.y );
    }

    ctx.stroke();

    // Draw line segment handlers.
    if ( editor.state === State.TRANSFORM ) {
      ctx.beginPath();

      level.segments.forEach(function( segment ) {
        x0 = segment.start.x;
        y0 = segment.start.y;
        x1 = segment.end.x;
        y1 = segment.end.y;

        ctx.moveTo( x0, y0 );
        ctx.arc( x0, y0, config.handlerRadius, 0, Geometry.PI2 );

        ctx.moveTo( x1, y1 );
        ctx.arc( x1, y1, config.handlerRadius, 0, Geometry.PI2 );
      });

      ctx.fillStyle = '#f43';
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }

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
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    size = Math.min( canvas.width, canvas.height );
  }

  canvas.addEventListener( 'mousedown', function( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    mouse.down = true;

    if ( editor.state === State.DRAW ) {
      editor.segment = [ mouse.x, mouse.y ];
    }

    if ( editor.state === State.TRANSFORM ) {
      var x, y;
      var i;
      var handlerRadiusSquared = config.handlerRadius * config.handlerRadius;
      data.forEach(function( segment ) {
        i = 0;
        while ( i < 2 ) {
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

    if ( editor.state === State.LIGHT ) {
      level.lightPosition( mouse.x, mouse.y );
      level.sweep( Math.PI );
    }

    if ( mouse.down && editor.state === State.TRANSFORM ) {
      editor.selection.forEach(function( element, index ) {
        var offset = editor.offsets[ index ];
        var endpoint = offset.endpoint;
        element[ 2 * endpoint ]     = mouse.x + offset.x;
        element[ 2 * endpoint + 1 ] = mouse.y + offset.y;
      });
    }
  });

  canvas.addEventListener( 'mouseup', function( event ) {
    mouse.down = false;

    if ( editor.state === State.DRAW ) {
      data.push(editor.segment.concat([
        mouse.x, mouse.y
      ]));

      editor.segment = [];

      level.load( size, margin, [], data );
      level.lightPosition( level.light.x, level.light.y );
      level.sweep( Math.PI );
    }

    if ( editor.start === State.TRANSFORM ) {
      editor.selection = [];
      editor.offsets = [];
    }
  });

  document.addEventListener( 'keydown', function( event ) {
    if ( mouse.down ) {
      return;
    }

    if ( event.shiftKey ) {
      editor.state = State.TRANSFORM;
    } else if ( event.altKey ) {
      editor.state = State.DELETE;
    } else if ( event.metaKey ) {
      editor.state = State.DRAW;
    }
  });

  document.addEventListener( 'keyup', function() {
    editor.state = State.LIGHT;
  });

  (function() {
    resize();

    level.load( size, margin, [], data );
    level.lightPosition( 200, 200 );
    level.sweep( Math.PI );

    tick();
  }) ();
});
