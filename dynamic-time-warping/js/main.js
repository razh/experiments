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
  var nData = [];
  var mData = [];

  (function() {
    var i, il;
    for ( i = 0, il = nCanvas.height; i < il; i++ ) {
      nData.push( nSinFn(i) );
    }

    for ( i = 0, il = mCanvas.width; i < il; i++ ) {
      mData.push( mSinFn(i) );
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

    drawLines( nContext, nData, drawScale );
    nContext.lineWidth = 1;
    nContext.strokeStyle = '#fff';
    nContext.stroke();
  }) ();

  (function() {
    mContext.translate( 0, 0.5 * mCanvas.height );

    drawLines( mContext, mData, drawScale );
    mContext.lineWidth = 1;
    mContext.strokeStyle = '#fff';
    mContext.stroke();
  }) ();

  (function() {
    var width  = matrixCanvas.width;
    var height = matrixCanvas.height;

    var diffArray = [];
    for ( var i = 0; i < height; i++ ) {
      diffArray.push( [] );
    }

    var imageData = matrixContext.getImageData( 0, 0, width, height ),
        data = imageData.data;

    // Calculate difference/cost.
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    var x, y;
    var d;
    for ( y = 0; y < height; y++ ) {
      for ( x = 0; x < width; x++ ) {
        d = Math.abs( nData[y] - mData[x] );
        if ( d < min ) {
          min = d;
        }

        if ( d > max ) {
          max = d;
        }

        diffArray[y][x] = d;
      }
    }

    // Normalize data and draw.
    var index;
    for ( y = 0; y < height; y++ ) {
      for ( x = 0; x < width; x++ ) {
        d = ( diffArray[y][x] - min ) / ( max - min );
        diffArray[y][x] = d;

        index = 4 * ( y * width + x );
        d = Math.round( d * 255 );
        data[ index     ] = d;
        data[ index + 1 ] = d;
        data[ index + 2 ] = d;
        data[ index + 3 ] = 255;
      }
    }

    matrixContext.putImageData( imageData, 0, 0 );
  }) ();

}) ( window, document );
