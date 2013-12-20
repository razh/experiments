/*globals URL*/
(function( window, document, undefined ) {
  'use strict';

  var canvas = document.createElement( 'canvas' ),
      ctx    = canvas.getContext( '2d' );

  document.body.appendChild( canvas );

  function exportCommands( image ) {
    var width = image.width;
    var height = image.height;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage( image, 0, 0 );

    var data = ctx.getImageData( 0, 0, width, height ).data;

    // Grab pixels.
    var pixels = [];
    var index;
    var i, j;
    var r, g, b;
    for ( i = 0; i < height; i++ ) {
      for ( j = 0; j < width; j++ ) {
        index = 4 * ( i * width + j );

        r = data[ index ];
        g = data[ index + 1 ];
        b = data[ index + 2 ];

        pixels.push([
          j, i,
          r, g, b
        ]);
      }
    }

    var commands = [];
    var pixel;
    for ( i = 0; i < pixels.length; i++ ) {
      pixel = pixels[i];

      commands.push(
        'fill(' +
        pixel[2] + ', ' +
        pixel[3] + ', ' +
        pixel[4] + ');'
      );

      commands.push(
        'rect(' + pixel[0] + ', ' + pixel[1] + ', 1, 1);'
      );
    }

    document.getElementById( 'export' ).value = commands.join( '\n' );
  }

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    var image = new Image();
    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
    image.onload = function() {
      exportCommands( image );
    };
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

}) ( window, document );
