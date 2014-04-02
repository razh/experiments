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

  // Diff/cost matrix.
  var matrixCanvas  = document.getElementById( 'matrix-canvas' ),
      matrixContext = matrixCanvas.getContext( '2d' );

  // Accumulated cost matrix.
  var costCanvas  = document.getElementById( 'cost-canvas' ),
      costContext = costCanvas.getContext( '2d' );

  // Scale of sin function.
  var drawScale = 10;

  // Set canvas dimensions.
  nCanvas.width  = 2 * drawScale;
  nCanvas.height = 200;

  mCanvas.width  = 300;
  mCanvas.height = 2 * drawScale;

  matrixCanvas.width  = mCanvas.width;
  matrixCanvas.height = nCanvas.height;

  costCanvas.width  = mCanvas.width;
  costCanvas.height = nCanvas.height;

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

  function drawNormalizedArray2D( ctx, array, width, height, min, max ) {
    var imageData = ctx.getImageData( 0, 0, width, height ),
        data = imageData.data;

    var index;
    var x, y;
    var t;
    for ( y = 0; y < height; y++ ) {
      for ( x = 0; x < width; x++ ) {
        t = ( array[y][x] - min ) / ( max - min );
        t = Math.round( t * 255 );

        index = 4 * ( y * width + x );
        data[ index     ] = t;
        data[ index + 1 ] = t;
        data[ index + 2 ] = t;
        data[ index + 3 ] = 255;
      }
    }

    ctx.putImageData( imageData, 0, 0 );
  }

  // Draw n data set.
  (function() {
    nContext.translate( 0.5 * nCanvas.width, nCanvas.height );
    nContext.rotate( -90 * DEG_TO_RAD );

    drawLines( nContext, nData, drawScale );
    nContext.lineWidth = 1;
    nContext.strokeStyle = '#fff';
    nContext.stroke();
  }) ();

  // Draw m data set.
  (function() {
    mContext.translate( 0, 0.5 * mCanvas.height );

    drawLines( mContext, mData, drawScale );
    mContext.lineWidth = 1;
    mContext.strokeStyle = '#fff';
    mContext.stroke();
  }) ();

  // Draw matrix data.
  // NOTE: x and y var names are not accurate to the theory.
  (function() {
    var width  = matrixCanvas.width;
    var height = matrixCanvas.height;

    var diffArray = [];
    for ( var i = 0; i < height; i++ ) {
      diffArray.push( [] );
    }

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
    drawNormalizedArray2D( matrixContext, diffArray, width, height, min, max );
  }) ();

  // Draw warping path.
  (function() {
    var width  = matrixCanvas.width;
    var height = matrixCanvas.height;

    // Accumulated cost matrix.
    var array = [];
    for ( var i = 0; i < height; i++ ) {
      array.push( [] );
    }

    // Initial cost values.
    array[0][0] = 0;

    var x, y;
    for ( y = 1; y < height; y++ ) {
      array[y][0] = Number.POSITIVE_INFINITY;
    }

    for ( x = 1; x < width; x++ ) {
      array[0][x] = Number.POSITIVE_INFINITY;
    }

    // Calculate cost matrix.
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    var cost;
    var sum;
    for ( y = 1; y < height; y++ ) {
      for ( x = 1; x < width; x++ ) {
        cost = Math.abs( nData[y] - mData[x] );
        sum = cost + Math.min(
          // Insertion.
          array[ y - 1 ][x],
          // Deletion.
          array[y] [ x - 1],
          // Match.
          array[ y - 1 ][ x - 1 ]
        );

        if ( sum < min ) {
          min = sum;
        }

        if ( sum > max ) {
          max = sum;
        }

        array[y][x] = sum;
      }
    }

    // Normalize and draw data.
    drawNormalizedArray2D( costContext, array, width, height, min, max );
  }) ();

}) ( window, document );
