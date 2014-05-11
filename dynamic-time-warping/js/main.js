/*globals Equation*/
(function( window, document, undefined ) {
  'use strict';

  var DEG_TO_RAD = Math.PI / 180;

  var sinFn = function( amplitude, frequency, phase ) {
    return function( t ) {
      return amplitude * Math.sin( frequency * t + phase );
    };
  };

  // Example functions.
  var nSinFn = sinFn( 1, 0.1, 0.5 );
  var mSinFn = sinFn( 1, 0.4, 0 );

  var config = {
    // Scale of drawn function.
    scale: 10
  };

  // Generated data.
  var data = {
    n: [],
    m: []
  };

  // Functions.
  var functions = {
    n: nSinFn,
    m: mSinFn
  };

  function generateData( fn, length ) {
    var array = [];

    for ( var i = 0; i < length; i++ ) {
      array.push( fn(i) );
    }

    return array;
  }

  var inputs = {
    nFn: document.querySelector( '#n-function' ),
    mFn: document.querySelector( '#m-function' ),
    scale: document.querySelector( '#scale' )
  };

  inputs.nFn.addEventListener( 'input', function() {
    var fn = Equation.evaluate( inputs.nFn.value );
    if ( typeof fn === 'function' ) {
      functions.n = fn;
      data.n = generateData( fn, nCanvas.height );
      draw();
    }
  });

  inputs.mFn.addEventListener( 'input', function() {
    var fn = Equation.evaluate( inputs.mFn.value );
    if ( typeof fn === 'function' ) {
      functions.m = fn;
      data.m = generateData( fn, mCanvas.width );
      draw();
    }
  });

  inputs.scale.addEventListener( 'input', function() {
    config.scale = parseFloat( inputs.scale.value );
    draw();
  });

  // Vertically-drawn canvas.
  var nCanvas  = document.getElementById( 'n-canvas' ),
      nContext = nCanvas.getContext( '2d' );

  // Horizontally drawn canvas.
  var mCanvas  = document.getElementById( 'm-canvas' ),
      mContext = mCanvas.getContext( '2d' );

  // Diff/cost matrix.
  var matrixCanvas = document.getElementById( 'matrix-canvas' );

  // Accumulated cost matrix.
  var costCanvas = document.getElementById( 'cost-canvas' );

  /**
   *  Two time-dependent sequences: n and m.
   *
   *   ---
   *    |
   *  n |
   *    |
   *   ---
   *        |---------|
   *             m
   */

  // Set canvas dimensions.
  nCanvas.width  = 3 * config.scale;
  nCanvas.height = 200;

  mCanvas.width  = 300;
  mCanvas.height = 3 * config.scale;

  matrixCanvas.width  = mCanvas.width;
  matrixCanvas.height = nCanvas.height;

  costCanvas.width  = mCanvas.width;
  costCanvas.height = nCanvas.height;

  (function generateInitialData( nFn, mFn ) {
    data.n = generateData( nFn, nCanvas.height );
    data.m = generateData( mFn, mCanvas.width );
  }) ( nSinFn, mSinFn );

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

  function drawNormalizedArray2D( options ) {
    options = options || {};

    var canvas = options.canvas;
    var array = options.array;
    var width = options.width;
    var height = options.height;
    var min = options.min;
    var max = options.max;

    canvas.width  = width;
    canvas.height = height;

    var ctx = canvas.getContext( '2d' );

    var imageData = ctx.getImageData( 0, 0, width, height ),
        data = imageData.data;

    var index;
    var x, y;
    var t;
    for ( y = 0; y < height; y++ ) {
      for ( x = 0; x < width; x++ ) {
        // Normalize.
        t = ( array[y][x] - min ) / ( max - min ) * 255;

        index = 4 * ( y * width + x );
        data[ index     ] = t;
        data[ index + 1 ] = t;
        data[ index + 2 ] = t;
        data[ index + 3 ] = 255;
      }
    }

    ctx.putImageData( imageData, 0, 0 );
  }

  /**
   * Calculate cost/difference matrix.
   *
   * Returns an object containing the cost matrix array as well as the
   * min and max cost values.
   */
  function costMatrix( n, m ) {
    var height = n.length;
    var width = m.length;

    var x, y;
    var array = [];
    for ( y = 0; y < height; y++ ) {
      array.push( [] );
    }

    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    var d;
    for ( y = 0; y < height; y++ ) {
      for ( x = 0; x < width; x++ ) {
        d = Math.abs( n[y] - m[x] );

        if ( d < min ) { min = d; }
        if ( d > max ) { max = d; }

        array[y][x] = d;
      }
    }

    return {
      array: array,
      min: min,
      max: max
    };
  }

  /**
   * Calculate accumulated cost matrix.
   *
   * Returns an object containing the cost matrix array as well as the
   * min and max accumulated cost values.
   */
  function accumulatedCostMatrix( n, m ) {
    var height = n.length;
    var width = m.length;

    var x, y;
    var array = [];
    for ( y = 0; y < height; y++ ) {
      array.push( [] );
    }

    // Initial cost values.
    array[0][0] = 0;

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
        cost = Math.abs( n[y] - m[x] );
        sum = cost + Math.min(
          // Insertion.
          array[ y - 1 ][x],
          // Deletion.
          array[y][ x - 1],
          // Match.
          array[ y - 1 ][ x - 1 ]
        );

        if ( sum < min ) { min = sum; }
        if ( sum > max ) { max = sum; }

        array[y][x] = sum;
      }
    }

    return {
      array: array,
      min: min,
      max: max
    };
  }

  function clear( canvas ) {
    var ctx = canvas.getContext( '2d' );
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
  }

  function draw() {
    clear( nCanvas );
    clear( mCanvas );
    clear( matrixCanvas );
    clear( costCanvas );

    // Draw n data set.
    nContext.save();
    nContext.translate( 0.5 * nCanvas.width, nCanvas.height );
    nContext.rotate( -90 * DEG_TO_RAD );

    drawLines( nContext, data.n, config.scale );
    nContext.lineWidth = 1;
    nContext.strokeStyle = '#fff';
    nContext.stroke();
    nContext.restore();

    // Draw m data set.
    mContext.save();
    mContext.translate( 0, 0.5 * mCanvas.height );

    drawLines( mContext, data.m, config.scale );
    mContext.lineWidth = 1;
    mContext.strokeStyle = '#fff';
    mContext.stroke();
    mContext.restore();

    // Draw cost matrix.
    var results = costMatrix( data.n, data.m );
    results.canvas = matrixCanvas;
    results.height = data.n.length;
    results.width = data.m.length;
    // Normalize data and draw.
    drawNormalizedArray2D( results );

    // Draw accumulated cost matrix.
    results = accumulatedCostMatrix( data.n, data.m );
    results.canvas = costCanvas;
    results.height = data.n.length;
    results.width = data.m.length;
    // Normalize and draw data.
    drawNormalizedArray2D( results );
  }

  draw();

}) ( window, document );
