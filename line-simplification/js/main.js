(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  function log2( n ) {
    return Math.log( n ) / Math.LN2;
  }

  function randomSignedFloat( n ) {
    return Math.random() * 2 * n - n;
  }

  function midpointDisplacement( options ) {
    options = options || {};

    var width        = options.width || 2,
        displacement = options.displacement || 1,
        roughness    = options.roughness || 0.5,
        start        = options.start,
        end          = options.end;

    var points = [];

    // Determine the lowest power of two that can cover the entire width.
    var power = Math.ceil( log2( width ) );
    var count = Math.pow( 2, power );

    // Initialize endpoints.
    start = typeof start !== 'undefined' ? start : randomSignedFloat( displacement );
    end   = typeof end   !== 'undefined' ? end   : randomSignedFloat( displacement );

    points[0]       = start;
    points[ count ] = end;

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

  function scaleFn( scale ) {
    return function( value ) {
      return scale * value;
    };
  }

  /**
   * Map function for converting an array of height values to two-dimensional
   * coordinates.
   */
  function to2d( height, index ) {
    return {
      x: index,
      y: height
    };
  }

  function drawPoints( ctx, points ) {
    ctx.beginPath();

    points.forEach(function( point ) {
      ctx.rect( point.x, point.y, 1, 1 );
    });
  }

  function drawLines( ctx, points ) {
    ctx.beginPath();

    ctx.moveTo( points[0].x, points[0].y );
    for ( var i = 1, il = points.length; i < il; i++ ) {
      ctx.lineTo( points[i].x, points[i].y );
    }
  }

  (function() {
    canvas.width  = 640;
    canvas.height = 480;

    var scaleY = scaleFn( 0.25 * canvas.height );

    var points = midpointDisplacement({
      width: canvas.width,
      roughness: 0.7
    }).map( scaleY )
      .map( to2d );

    var ctx = context;

    ctx.save();

    // Points.
    ctx.translate( 0, 0.4 * canvas.height );

    drawPoints( ctx, points );
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Lines.
    ctx.translate( 0, 0.1 * canvas.height );

    drawLines( ctx, points );
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    var simple = simplify( points ).filter(function( point ) {
      return point.area >= 2000;
    });
    console.log(points.length, simple.length)

    ctx.translate( 0, 0.1 * canvas.height );
    drawLines( ctx, simple );
    ctx.stroke();

    ctx.restore();
  }) ();
}) ( window, document );
