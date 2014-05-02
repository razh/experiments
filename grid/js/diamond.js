(function( window, document, undefined) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw( context );
  }

  window.addEventListener( 'resize', resize );

  /**
   * Draws n segments from (x, y) to evenly-spaced points on
   * the line segment (x0, y0) - (x1, y1).
   */
  function drawPointSegmentLines( ctx, x, y, x0, y0, x1, y1, n ) {
    // Steps.
    var dx = ( x1 - x0 ) / n,
        dy = ( y1 - y0 ) / n;

    for ( var i = 0; i < n; i++ ) {
      ctx.moveTo( x, y );
      ctx.lineTo( x0 + i * dx, y0 + i * dy );
    }
  }

  /**
   * Draws n segments connecting the line segments (x0, y0) - (x1, y1)
   * and (x2, y2) - (x3, y3).
   */
  function drawPairLines( ctx, x0, y0, x1, y1, x2, y2, x3, y3, n ) {
    var dx0 = ( x1 - x0 ) / n,
        dy0 = ( y1 - y0 ) / n;

    var dx1 = ( x3 - x2 ) / n,
        dy1 = ( y3 - y2 ) / n;

    for ( var i = 0; i < n; i++ ) {
      ctx.moveTo( x0 + i * dx0, y0 + i * dy0 );
      ctx.lineTo( x2 + i * dx1, y2 + i * dy1 );
    }
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    var n = 24;

    ctx.clearRect( 0, 0, width, height );

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';

    ctx.beginPath();
    // Top-left quadrant.
    drawPointSegmentLines( ctx, halfWidth, 0, 0, halfHeight, 0, 0, n );
    drawPointSegmentLines( ctx, 0, halfHeight, halfWidth, halfHeight, halfWidth, 0, n );
    drawPairLines( ctx, 0, 0, halfWidth, 0, 0, halfHeight, halfWidth, halfHeight, n );
    // Top-right quadrant.
    drawPointSegmentLines( ctx, halfWidth, 0, halfWidth, halfHeight, width, halfHeight, n );
    drawPointSegmentLines( ctx, width, halfHeight, halfWidth, 0, width, 0, n );
    drawPairLines( ctx, halfWidth, 0, halfWidth, halfHeight, width, 0, width, halfHeight, n );
    // Bottom-left quadrant.
    drawPointSegmentLines( ctx, halfWidth, height, halfWidth, halfHeight, 0, halfHeight, n );
    drawPointSegmentLines( ctx, 0, halfHeight, halfWidth, height, 0, height, n );
    drawPairLines( ctx, 0, height, 0, halfHeight, halfWidth, height, halfWidth, halfHeight, n );
    // Bottom-right quadrant.
    drawPointSegmentLines( ctx, halfWidth, height, width, halfHeight, width, height, n );
    drawPointSegmentLines( ctx, width, halfHeight, halfWidth, halfHeight, halfWidth, height, n );
    drawPairLines( ctx, width, height, halfWidth, height, width, halfHeight, halfWidth, halfHeight, n );
    ctx.stroke();
  }

  resize();
}) ( window, document );
