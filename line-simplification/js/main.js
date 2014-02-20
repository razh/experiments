(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var points = [];

  function midpointDisplacement( options ) {
    options = options || {};

    var width = options.width || 2,
        count = options.count || 2;

    var points = [];

    // Start point.
    var x0 = 0,
        y0 = 0;

    // End point.
    var x1 = width,
        y1 = 0;

    var mx, my;
    for ( var i = 2; i < count; i++ ) {
      mx = 0.5 * ( x0 + x1 );
      my = 0.5 * ( y0 + y1 );
      break;
    }

    return points;
  }

  function drawPoints( ctx, points ) {
    ctx.beginPath();

    points.forEach(function( point ) {
      ctx.rect( point.x, point.y, 1, 1 );
    });
  }

  function drawLines( ctx, points ) {

  }
}) ( window, document );
