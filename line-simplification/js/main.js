/*globals simplify*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var simpleCanvas  = document.getElementById( 'simple-canvas' ),
      simpleContext = simpleCanvas.getContext( '2d' );

  function log2( n ) {
    return Math.log( n ) / Math.LN2;
  }

  function randomSignedFloat( n ) {
    return Math.random() * 2 * n - n;
  }

  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
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
    if ( !points.length ) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo( points[0].x, points[0].y );
    for ( var i = 1, il = points.length; i < il; i++ ) {
      ctx.lineTo( points[i].x, points[i].y );
    }
  }

  function drawSimple( ctx, points ) {
    ctx.save();

    ctx.translate( 0, 0.6 * canvas.height );
    drawPoints( ctx, points );
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.translate( 0, 0.1 * canvas.height );
    drawLines( ctx, points );
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    ctx.restore();
  }

  (function() {
    var ctx;
    var points;
    var min, max;

    function resize() {
      var width  = Math.min( 0.8 * window.innerWidth,  640 ),
          height = Math.min( 0.8 * window.innerHeight, 480 );

      simpleCanvas.width  = canvas.width  = width;
      simpleCanvas.height = canvas.height = height;
      ctx = context;

      var scaleY = scaleFn( 0.25 * canvas.height );

      points = midpointDisplacement({
        width: canvas.width,
        roughness: 0.7
      }).map( scaleY )
        .map( to2d );

      // Draw.
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

      ctx.restore();

      // Switch contexts.
      ctx = simpleContext;

      // Calculate areas.
      simplify( points );

      min = Number.POSITIVE_INFINITY;
      max = Number.NEGATIVE_INFINITY;

      points.forEach(function( point ) {
        min = Math.min( min, point.area );
        max = Math.max( max, point.area );
      });
    }

    resize();

    window.addEventListener( 'resize', resize );
    window.addEventListener( 'orientationchange', resize );

    function onMouse( event ) {
      // Interpolate along a power scale.
      var x = event.pageX / window.innerWidth;
      x = Math.pow( x, 7 );

      var area = min + ( max - min ) * x;

      var filteredPoints = points.filter(function( point ) {
        return point.area >= area;
      });

      ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
      drawSimple( ctx, filteredPoints );

      // Draw debug text.
      ctx.font = '12pt monospace';
      ctx.fillStyle = '#888';
      ctx.fillText( 'min-area: ' + round( area, 2 ), 32, 32 );

      ctx.fillText(
        'area range: [' +
          round( min, 2 ) + ', ' +
          round( max, 2 ) +
        ']', 32, 64
      );

      ctx.fillText(
        'points: ' +
        filteredPoints.length + '/' +
        points.length + ': ' +
        round( filteredPoints.length / points.length * 100, 2 ) + '%',
        32, 96
      );
    }

    if ( 'ontouchstart' in window ) {
      window.addEventListener( 'touchmove', function( event ) {
        event.preventDefault();
        onMouse( event.touches[0] );
      });
    } else {
      window.addEventListener( 'mousemove', onMouse );
    }
  }) ();

}) ( window, document );
