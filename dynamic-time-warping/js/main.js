(function( window, document, undefined ) {
  'use strict';

  var DEG_TO_RAD = Math.PI / 180;

  var sinFn = function( amplitude, frequency, phase ) {
    return function( t ) {
      return amplitude * Math.sin( frequency * t + phase );
    };
  };

  var nSinFn = sinFn( 1, 0.1, 0.5 );
  var mSinFn = sinFn( 1, 0.4, 0 );

  // Vertically-drawn canvas.
  var nCanvas  = document.getElementById( 'n-canvas' ),
      nContext = nCanvas.getContext( '2d' );

  // Horizontally drawn canvas.
  var mCanvas  = document.getElementById( 'm-canvas' ),
      mContext = mCanvas.getContext( '2d' );

  var matrixCanvas  = document.getElementById( 'matrix-canvas' ),
      matrixContext = matrixCanvas.getContext( '2d' );

  // Scale of sin function.
  var drawScale = 10;

  // Set canvas dimensions.
  nCanvas.width  = 2 * drawScale;
  nCanvas.height = 200;

  mCanvas.width  = 300;
  mCanvas.height = 2 * drawScale;

  matrixCanvas.width  = mCanvas.width;
  matrixCanvas.height = nCanvas.height;

  // Generate data.
  var data = {
    n: [],
    m: [],
    matrix: []
  };

  var i, il;

  (function() {
    for ( i = 0, il = nCanvas.height; i < il; i++ ) {
      data.n.push( nSinFn(i) );
    }

    for ( i = 0, il = mCanvas.width; i < il; i++ ) {
      data.m.push( mSinFn(i) );
    }
  }) ();

  // Draw data.
  function drawLines( ctx, data, scale ) {
    if ( !data.length ) {
      return;
    }

    scale = scale || 1;

    ctx.beginPath();
    ctx.moveTo( 0, data[0] * scale );
    for ( var i = 1, il = data.length; i < il; i++ ) {
      ctx.lineTo( i, data[i] * scale );
    }
  }

  (function() {
    nContext.translate( 0.5 * nCanvas.width, nCanvas.height );
    nContext.rotate( -90 * DEG_TO_RAD );

    drawLines( nContext, data.n, drawScale );
    nContext.lineWidth = 1;
    nContext.strokeStyle = '#fff';
    nContext.stroke();
  }) ();

  (function() {
    mContext.translate( 0, 0.5 * mCanvas.height );

    drawLines( mContext, data.m, drawScale );
    mContext.lineWidth = 1;
    mContext.strokeStyle = '#fff';
    mContext.stroke();
  }) ();

}) ( window, document );
