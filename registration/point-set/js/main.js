(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var pointsA = [],
      pointsB = [];

  function randomPointInCircle( x, y, radius ) {
    var r = radius * Math.sqrt( Math.random() ),
        theta = PI2 * Math.random();

    return [
      x + r * Math.cos( theta ),
      y + r * Math.sin( theta )
    ];
  }

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function lerpArray( n, m, t ) {
    var length = Math.min( n.length, m.length );

    var array = [];
    for ( var i = 0; i < length; i++) {
      array.push( lerp( n[i], m[i], t ) );
    }

    return array;
  }

  function minIndex( array ) {
    var min = Number.POSITIVE_INFINITY,
        index = 0;

    for ( var i = 0, il = array.length; i < il; i++ ) {
      if ( array[i] < min ) {
        min = array[i];
        index = i;
      }
    }

    return {
      min: min,
      index: index
    };
  }

  /**
   * Array minima mutation functions.
   */
  function subtractRowMinima( row ) {
    var min = Math.min.apply( Math, row );

    for ( var i = 0, il = row.length; i < il; i++ ) {
      row[i] -= min;
    }

    return row;
  }

  /**
   * Takes a two-dimensional array.
   */
  function subtractColumnMinima( array, columnIndex ) {
    var min = Number.POSITIVE_INFINITY;
    var value;
    var i, il;
    // Create col array and find min.
    for ( i = 0, il = array.length; i < il; i++ ) {
      value = array[i][ columnIndex ];
      if ( value < min ) {
        min = value;
      }
    }

    for ( i = 0, il = array.length; i < il; i++ ) {
      array[i][ columnIndex ] -= min;
    }

    return array;
  }

  function costMatrix( n, m ) {
    var height = 0.5 * n.length;
    var width = 0.5 * m.length;

    var array = [];
    for ( var y = 0; y < height; y++ ) {
      array.push( [] );
    }

    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    var dx, dy;
    var d;
    var i, j;
    var xi, yi, xj, yj;
    for ( j = 0; j < height; j++ ) {
      for ( i = 0; i < width; i++ ) {
        xi = m[ 2 * i ];
        yi = m[ 2 * i + 1 ];
        xj = n[ 2 * j ];
        yj = n[ 2 * j + 1 ];

        dx = xj - xi;
        dy = yj - yi;

        d = Math.sqrt( dx * dx + dy * dy );

        if ( d < min ) { min = d; }
        if ( d > max ) { max = d; }

        array[j][i] = d;
      }
    }

    return array;
  }

  function drawPoints( ctx, points ) {
    for ( var i = 0, il = 0.5 * points.length; i < il; i++ ) {
      ctx.rect( points[ 2 * i ], points[ 2 * i + 1 ], 3, 3 );
    }
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();
    drawPoints( ctx, pointsA );
    ctx.fillStyle = '#f00';
    ctx.fill();

    ctx.beginPath();
    drawPoints( ctx, pointsB );
    ctx.fillStyle = '#0f0';
    ctx.fill();
  }

  function init() {
    var x = 0.5 * window.innerWidth,
        y = 0.5 * window.innerHeight;

    var pointCount = 100;
    while ( pointCount-- ) {
      pointsA = pointsA.concat( randomPointInCircle( x, y, 100 ) );
      pointsB = pointsB.concat( randomPointInCircle( x, y, 200 ) );
    }

    costMatrix( pointsA, pointsB );
  }

  init();
  draw( context );

}) ( window, document );
