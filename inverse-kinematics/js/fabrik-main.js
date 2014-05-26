/*globals IK, Fabrik*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 768;
  canvas.height = 768;

  var fabrik = new Fabrik( 256, 256 );
  IK.fromArray( fabrik, [ 70, 50, 80, 50 ] );

  var mouse = {
    x: 0,
    y: 0
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Draw mouse point.
    ctx.beginPath();
    ctx.arc( mouse.x, mouse.y, 4, 0, 2 * Math.PI );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw links.
    ctx.beginPath();
    IK.drawPath( ctx, fabrik );
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
  }

  draw( context );

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  function onMouseMove( event ) {
    mousePosition( event );
    fabrik.set( mouse.x, mouse.y );
    draw( context );
  }

  function onTouch( event ) {
    onMouseMove( event.touches[0] );
  }

  if ( 'ontouchstart' in window ) {
    window.addEventListener( 'touchstart', onTouch );

    window.addEventListener( 'touchmove', function() {
      event.preventDefault();
      onTouch( event );
    });
  } else {
    window.addEventListener( 'mousemove', onMouseMove );
  }

}) ( window, document );
