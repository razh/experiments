(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var pointsA = [],
      pointsB = [];

  function randomPointInCircle( x, y, radius ) {
    var r = radius * Math.sqrt( Math.random() ),
        theta = PI2 * Math.random();

    return [
      x + r * Math.cos( theta ),
      y + r * Math.sin( theta )
    ];
  }


  function drawPoints( ctx, points ) {
    for ( var i = 0, il = 0.5 * points.length; i < il; i++ ) {
      ctx.rect( points[ 2 * i ], points[ 2 * i + 1 ], 3, 3 );
    }
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();
    drawPoints( ctx, pointsA );
    ctx.fillStyle = '#f00';
    ctx.fill();

    ctx.beginPath();
    drawPoints( ctx, pointsB );
    ctx.fillStyle = '#0f0';
    ctx.fill();
  }

  function init() {
    var x = 0.5 * window.innerWidth,
        y = 0.5 * window.innerHeight;

    var pointCount = 100;
    while ( pointCount-- ) {
      pointsA = pointsA.concat( randomPointInCircle( x, y, 100 ) );
      pointsB = pointsB.concat( randomPointInCircle( x, y, 200 ) );
    }
  }

  init();
  draw( context );

}) ( window, document );
