/*globals define*/
define([
  'input',
  'point',
  'constraint'
], function( Input, Point, Constraint ) {
  'use strict';

  console.log( 'An implementation of Stuffit\'s Tear-able Cloth codepen project.' );
  console.log( 'codepen.io/stuffit/pen/KrAwx' );

  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var iterationCount = 5;

  var points = [];

  var prevTime = Date.now(),
      currTime,
      running = true;

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function update() {
    if ( Input.keys[ 27 ] ) {
      running = false;
      return;
    }

    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    var i = iterationCount;

    while( i-- ) {
      var p = points.length;
      while ( p-- ) {
        points[p].resolve();
      }
    }

    points.forEach(function( point ) {
      point.update( dt );
    });
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();

    points.forEach(function( point ) {
      point.draw( ctx );
    });

    ctx.stroke();
  }

  function init() {
    document.addEventListener( 'keydown', Input.onKeyDown );
    document.addEventListener( 'keyup', Input.onKeyUp );

    canvas.addEventListener( 'mousedown', Input.onMouseDown );
    canvas.addEventListener( 'mousemove', Input.onMouseMove );
    canvas.addEventListener( 'mouseup', Input.onMouseUp );

    var xCount = 15,
        yCount = 10;

    var spacing = 15;

    var i, j;
    for ( j = 0; j < yCount; j++ ) {
      for ( i = 0; i < xCount; i++ ) {
        var point = new Point( i * spacing + spacing, j * spacing + spacing );

        if ( i ) {
          point.attach( points[ points.length - 1 ] );
        }

        if ( j ) {
          point.attach( points[ i + ( j - 1 ) * xCount ] );
        } else {
          point.pin( point.x, point.y );
        }

        points.push( point );
      }
    }

    context.lineWidth = 0.5;
    context.strokeStyle = 'black';

    tick();
  }

  init();
});
