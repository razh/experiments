(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var pointsA = [],
      pointsB = [],
      pointsLerp = [];

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

  function costMatrix( n, m ) {
    var height = 0.5 * n.length;
    var width = 0.5 * m.length;

    var array = [];
    for ( var y = 0; y < height; y++ ) {
      array.push( [] );
    }

    var dx, dy;
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

        array[j][i] = Math.sqrt( dx * dx + dy * dy );
      }
    }

    return array;
  }

  function drawPoints( ctx, points, size ) {
    size = size || 3;
    var halfSize = 0.5 * size;

    for ( var i = 0, il = 0.5 * points.length; i < il; i++ ) {
      ctx.rect(
        points[ 2 * i     ] - halfSize,
        points[ 2 * i + 1 ] - halfSize,
        size, size
      );
    }
  }

  /**
   * Draw line segments between corresponding vertex pairs (by index) in
   * the two arrays: n, m.
   */
  function drawSegments( ctx, n, m ) {
    var length = Math.min( n.length, m.length );

    for ( var i = 0, il = 0.5 * length; i < il; i++ ) {
      ctx.moveTo( n[ 2 * i ], n[ 2 * i + 1 ] );
      ctx.lineTo( m[ 2 * i ], m[ 2 * i + 1 ] );
    }
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Draw lerped points.
    ctx.beginPath();
    drawPoints( ctx, pointsLerp );
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw connecting segments.
    ctx.beginPath();
    drawSegments( ctx, pointsA, pointsB );
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Draw point sets.
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

  window.addEventListener( 'mousemove', function( event ) {
    var xt = event.pageX / window.innerWidth;
    // Smoother step: 6t^5 - 15t^4 + 10t^3.
    xt = 6 * Math.pow( xt, 5 ) - 15 * Math.pow( xt, 4 ) + 10 * Math.pow( xt, 3 );
    pointsLerp = lerpArray( pointsA, pointsB, xt );
    draw( context );
  });

}) ( window, document );
