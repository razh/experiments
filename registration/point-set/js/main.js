(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var points = {
    a: [],
    b: [],
    lerp: []
  };

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
    drawPoints( ctx, points.lerp );
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw connecting segments.
    ctx.beginPath();
    drawSegments( ctx, points.a, points.b );
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Draw point sets.
    ctx.beginPath();
    drawPoints( ctx, points.a );
    ctx.fillStyle = '#f00';
    ctx.fill();

    ctx.beginPath();
    drawPoints( ctx, points.b );
    ctx.fillStyle = '#0f0';
    ctx.fill();
  }

  function resize() {
    var width  = window.innerWidth,
        height = window.innerHeight;

    canvas.width  = width;
    canvas.height = height;

    var x = 0.5 * width,
        y = 0.5 * height;

    var radius = 0.5 * Math.min( width, height );

    // Reset points.
    points.a = [];
    points.b = [];
    points.lerp = [];

    var pointCount = 100;
    while ( pointCount-- ) {
      points.a = points.a.concat( randomPointInCircle( x, y, 0.4 * radius ) );
      points.b = points.b.concat( randomPointInCircle( x, y, 0.8 * radius ) );
    }

    costMatrix( points.a, points.b );

    draw( context );
  }

  resize();

  function onMouse( event ) {
    var xt = event.pageX / window.innerWidth;
    // Smoother step: 6t^5 - 15t^4 + 10t^3.
    xt = 6 * Math.pow( xt, 5 ) - 15 * Math.pow( xt, 4 ) + 10 * Math.pow( xt, 3 );
    points.lerp = lerpArray( points.a, points.b, xt );
    draw( context );
  }

  function onTouch( event ) {
    onMouse( event.touches[0] );
  }

  if ( 'ontouchstart' in window ) {
    window.addEventListener( 'touchstart', onTouch );

    window.addEventListener( 'touchmove', function( event ) {
      event.preventDefault();
      onTouch( event );
    });
  } else {
    window.addEventListener( 'mousemove', onMouse );
  }

  window.addEventListener( 'resize', resize );
  window.addEventListener( 'orientationchange', resize );

}) ( window, document );
