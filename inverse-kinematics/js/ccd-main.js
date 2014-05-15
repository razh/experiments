/*globals CCD*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 768;
  canvas.height = 768;

  var ccd = new CCD( 256, 256 );
  ccd.fromArray( [ 50, 60, 80, 30 ] );

  var mouse = {
    x: 0,
    y: 0
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();
    ccd.draw( ctx );
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }

  draw( context );

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  window.addEventListener( 'mousemove', function( event ) {
    mousePosition( event );
    ccd.set( mouse.x, mouse.y );
    draw( context );
  });

}) ( window, document );
