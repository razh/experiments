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
  (function() {
    nContext.translate( 0.5 * nCanvas.width, nCanvas.height );
    nContext.rotate( -90 * DEG_TO_RAD );

    nContext.beginPath();
    for ( i = 0, il = data.n.length; i < il; i++ ) {
      nContext.rect( i, data.n[i] * drawScale, 1, 1 );
    }

    nContext.fillStyle = '#fff';
    nContext.fill();
  }) ();

  (function() {
    mContext.translate( 0, 0.5 * mCanvas.height );

    mContext.beginPath();
    for ( i = 0, il = data.m.length; i < il; i++ ) {
      mContext.rect( i, data.m[i] * drawScale, 1, 1 );
    }

    mContext.fillStyle = '#fff';
    mContext.fill();
  }) ();

}) ( window, document );
