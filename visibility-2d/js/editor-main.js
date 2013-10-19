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
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    level.draw( ctx );

    if ( editor.segment.length ) {
      ctx.moveTo( editor.segment[0], editor.segment[1] );
      ctx.lineTo( mouse.x, mouse.y );
    }

    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc( level.light.x, level.light.y, 5, 0, Geometry.PI2 );
    ctx.fill();

    ctx.beginPath();
    var x0, y0, x1, y1;
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
  });

  canvas.addEventListener( 'mousemove', function( event ) {
    mouse.x = Geometry.limit( event.pageX, margin + EPSILON, size - margin - EPSILON );
    mouse.y = Geometry.limit( event.pageY, margin + EPSILON, size - margin - EPSILON );

    if ( editor.state === State.LIGHT ) {
      level.lightPosition( mouse.x, mouse.y );
      level.sweep( Math.PI );
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
