/*globals $*/
$(function() {
  'use strict';

  var $window = $( window );

  var $noiseCanvas = $( '#noise' ),
      noiseCanvas  = $noiseCanvas[0],
      noiseCtx     = noiseCanvas.getContext( '2d' );

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
    noiseCanvas.width = $window.width();
    noiseCanvas.height = $window.height();

    draw( noiseCtx );
  }

  resize();
  $window.on( 'resize', resize );
});
