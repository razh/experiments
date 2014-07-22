(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 640;
  canvas.height = 480;

  function draw( ctx ) {
    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
  }

  draw( context );

}) ( window, document );
