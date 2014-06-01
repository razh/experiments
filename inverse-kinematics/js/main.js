(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;
  var EPSILON = 1e-5;

  var DEG_TO_RAD = Math.PI / 180;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var width = window.innerWidth,
      height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  var origin = {
    x: 0.5 * width,
    y: 0.5 * height
  };

  var radius = 0.5 * Math.min( width, height );

  var lengths = {
    a: 0.3 * radius,
    b: 0.5 * radius
  };

  var angles = {
    a: 30 * DEG_TO_RAD,
    b: -160 * DEG_TO_RAD
  };

  var mouse = {
    x: 0,
    y: 0
  };

  var left = false;

  /**
   * Calculate the angle of the second joint.
   *
   * Where the point (x, y) is the endpoint and a and b are the respective arm
   * lengths.
   */
  function angleB( x, y, a, b ) {
    /**
     *  By the law of cosines:
     *
     *   x^2 + y^2 = a^2 + b^2 - 2ab * cos(angle)
     *
     *  We get:
     *
     *  cos(angle) = x^2 + y^2 - a^2 - b^2
     *               ---------------------
     *                        2ab
     */
    return Math.acos( ( x * x + y * y - a * a - b * b ) / ( 2 * a * b ) );
  }

  /**
   * Calculate the angle of the first joint.
   *
   * Where angle is that of the second joint.
   */
  function angleA( x, y, a, b, angle ) {
    var cos = Math.cos( angle ),
        sin = Math.sin( angle );

    var dy = y * ( b * cos + a ) - x * ( b * sin ),
        dx = x * ( b * cos + a ) + y * ( b * sin );

    return Math.atan2( dy, dx );
  }

  function update() {
    var dx = mouse.x - origin.x,
        dy = mouse.y - origin.y;

    // Normalize and clamp (taking into account rounding error).
    var rmin = Math.abs( lengths.b - lengths.a ) + EPSILON,
        rmax = lengths.a + lengths.b - EPSILON;

    var radius = Math.sqrt( dx * dx + dy * dy );
    var scale;
    if ( radius < rmin )  {
      scale = rmin / radius;
      dx *= scale;
      dy *= scale;
    }

    if ( radius > rmax ) {
      scale = rmax / radius;
      dx *= scale;
      dy *= scale;
    }

    angles.b = angleB( dx, dy, lengths.a, lengths.b );
    if ( left ) {
      angles.b = -angles.b;
    }

    angles.a = angleA( dx, dy, lengths.a, lengths.b, angles.b );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Draw origin.
    ctx.beginPath();
    ctx.arc( origin.x, origin.y, 3, 0, PI2 );
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw radii.
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#fff';
    // Inner radius.
    ctx.beginPath();
    ctx.arc( origin.x, origin.y, Math.abs( lengths.b - lengths.a ), 0, PI2 );
    ctx.stroke();
    // Outer radius.
    ctx.beginPath();
    ctx.arc( origin.x, origin.y, lengths.a + lengths.b, 0, PI2 );
    ctx.stroke();

    // Draw bones.
    ctx.save();

    ctx.beginPath();

    ctx.translate( origin.x, origin.y );
    ctx.moveTo( 0, 0 );

    ctx.rotate( angles.a );
    ctx.translate( lengths.a, 0 );
    ctx.lineTo( 0, 0 );

    ctx.rotate( angles.b );
    ctx.lineTo( lengths.b, 0 );

    ctx.restore();

    ctx.lineWidth = 1;
    ctx.stroke();
  }

  draw( context );


  function onMouse( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;

    update();
    draw( context );
  }

  function onTouch( event ) {
    onMouse( event.touches[0] );
  }

  if ( 'ontouchstart' in window ) {
    window.addEventListener( 'touchmove', function( event ) {
      event.preventDefault();
      onTouch( event );
    });

    window.addEventListener( 'touchstart', function( event ) {
      left = !left;
      onTouch( event );
    });
  } else {
    window.addEventListener( 'mousemove', onMouse );

    // Flip joint bend.
    window.addEventListener( 'mousedown', function( event ) {
      left = !left;
      onMouse( event );
    });
  }

}) ( window, document );
