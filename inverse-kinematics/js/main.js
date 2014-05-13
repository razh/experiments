(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var DEG_TO_RAD = Math.PI / 180;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = 512;
  canvas.height = 512;

  var origin = {
    x: 256,
    y: 256
  };

  var lengths = {
    a: 100,
    b: 150
  };

  var angles = {
    a: 30 * DEG_TO_RAD,
    b: -160 * DEG_TO_RAD
  };

  var mouse = {
    x: 0,
    y: 0
  };

  function angleB( x, y, l0, l1 ) {
    return Math.acos( ( x * x + y * y - l0 * l0 - l1 * l1 ) / ( 2 * l0 * l1 ) );
  }

  function angleA( x, y, l0, l1, angle ) {
    var cos = Math.cos( angle ),
        sin = Math.sin( angle );

    var num = y * ( l1 * cos + l0 ) - x * ( l1 * sin );
    var den = x * ( l1 * cos + l0 ) + y * ( l1 * sin );

    return Math.atan2( num, den );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Draw origin.
    ctx.beginPath();
    ctx.arc( origin.x, origin.y, 3, 0, PI2 );
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw radii.
    // Inner radius.
    ctx.beginPath();
    ctx.arc( origin.x, origin.y, Math.abs( lengths.b - lengths.a ), 0, PI2 );
    // Outer radius.
    ctx.arc( origin.x, origin.y, lengths.a + lengths.b, 0, PI2 );
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Draw bones.
    ctx.save();

    ctx.beginPath();
    ctx.moveTo( origin.x, origin.y );
    ctx.translate( origin.x, origin.y );

    ctx.rotate( angles.a );
    ctx.lineTo( lengths.a, 0 );
    ctx.translate( lengths.a, 0 );

    ctx.rotate( angles.b );
    ctx.lineTo( lengths.b, 0 );

    ctx.restore();

    ctx.lineWidth = 1;
    ctx.stroke();
  }

  draw( context );

  window.addEventListener( 'mousemove', function() {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;

    var dx = mouse.x - origin.x,
        dy = mouse.y - origin.y;

    angles.b = angleB( dx, dy, lengths.a, lengths.b );
    angles.a = angleA( dx, dy, lengths.a, lengths.b, angles.b );

    draw( context );
  });

}) ( window, document );
