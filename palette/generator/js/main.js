/*global Color, DominantColorCalculator*/
(function( window, document, undefined ) {
  'use strict';

  var colorsEl = document.querySelector( '.colors' );

  var canvas  = document.createElement( 'canvas' ),
      context = canvas.getContext( '2d' );

  function intToRgb( color ) {
    return 'rgb(' +
      Color.red(   color ) + ', ' +
      Color.green( color ) + ', ' +
      Color.blue(  color ) +
    ')';
  }

  function prepend( el ) {
    document.body.insertBefore( el, document.body.firstChild );
  }

  var image = new Image();
  image.onload = function() {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage( image, 0, 0, canvas.width, canvas.height );
    prepend( canvas );

    var messageEl = document.querySelector( '.message' );
    if ( messageEl ) {
      document.body.removeChild( messageEl );
    }

    console.time( 'color' );
    var calculator = new DominantColorCalculator(
      context.getImageData( 0, 0, canvas.width, canvas.height )
    );
    console.timeEnd( 'color' );

    var colorScheme = calculator.colorScheme;

    console.log( colorScheme );
    Object.keys( colorScheme ).forEach(function( key ) {
      var el = document.createElement( 'div' );
      el.className = 'color';

      var color = intToRgb( colorScheme[ key ] );
      el.style.backgroundColor = color;
      el.setAttribute( 'data-color', color );

      colorsEl.appendChild( el );
    });
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
