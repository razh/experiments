/*global DominantColorCalculator*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.createElement( 'canvas' ),
      context = canvas.getContext( '2d' );


  function prepend( el ) {
    document.body.insertBefore( el, document.body.firstChild );
  }

  var image = new Image();
  image.onload = function() {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage( image, 0, 0 );

    var calculator = new DominantColorCalculator(
      context.getImageData( 0, 0, canvas.width, canvas.height )
    );

    console.log( calculator.colorScheme );
    prepend( image );
  };

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();
    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

}) ( window, document );
