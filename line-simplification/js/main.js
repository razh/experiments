(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var points = [];

  function log2( n ) {
    return Math.log( n ) / Math.LN2;
  }

  function randomSignedFloat( n ) {
    return Math.random() * 2 * n - n;
  }

  function midpointDisplacement( options ) {
    options = options || {};

    var width = options.width || 2,
        displacement = options.displacement || 1,
        roughness = options.roughness || 0.5;

    var points = [];

    // Determine the lowest power of two that can cover the entire width.
    var power = Math.ceil( log2( width ) );
    var count = Math.pow( 2, power );

    // Initialize endpoints.
    points[0]       = randomSignedFloat( displacement );
    points[ count ] = randomSignedFloat( displacement );


    /**
     *  Inner loop, for values of:
     *   - count: 64
     *   - i (power of two): 4
     *   - step: 16
     *   - delta: 8
     *
     *                 step                            step
     *           |---------------|               |---------------|
     *     delta   delta                   delta   delta
     *   |-------o-------|               |-------o-------|
     *   |.......|.......|.......|.......|.......|.......|.......|.......|
     *   0       7       15      23      31      39      47      55      63
     *   |-------|       |-------o-------|               |-------o-------|
     *     delta           delta   delta                   delta   delta
     *                           |---------------|
     *                                 step
    */
    var step, delta;
    var i, j;
    // For each power of two.
    for ( i = 1; i < count; i *= 2 ) {
      displacement *= roughness;
      step = count / i;
      delta = 0.5 * step;

      for ( j = delta; j < count; j += step ) {
        // Midpoint.
        points[j] = 0.5 * ( points[ j - delta ] + points[ j + delta ] );
        // Displace.
        points[j] += randomSignedFloat( displacement );
      }
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
