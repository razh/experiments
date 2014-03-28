(function( window, document, undefined ) {
  'use strict';

  var noiseCanvas = document.getElementById( 'noise' ),
      noiseCtx    = noiseCanvas.getContext( '2d' );

  function draw( ctx ) {
    var imageData = ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height ),
        data = imageData.data;

    var length = data.length;

    var i = 0;
    while ( i < length ) {
      // Set RGB.
      data[ i++ ] = data[ i++ ] = data[ i++ ] = Math.round( Math.random() * 256 );
      // Set alpha.
      data[ i++ ] = 255;
    }

    ctx.putImageData( imageData, 0, 0 );
  }

  function resize() {
    noiseCanvas.width  = window.innerWidth;
    noiseCanvas.height = window.innerHeight;

    draw( noiseCtx );
  }

  resize();
  window.addEventListener( 'resize', resize );

}) ( window, document );
