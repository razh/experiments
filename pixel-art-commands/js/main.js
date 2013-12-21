/*globals URL*/
(function( window, document, undefined ) {
  'use strict';

  var canvas = document.createElement( 'canvas' ),
      ctx    = canvas.getContext( '2d' );

  var image;

  canvas.width = 0;
  canvas.height = 0;

  document.body.appendChild( canvas );

  function exportCommands( image ) {
    if ( !image ) {
      return;
    }

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

        // Alpha. Ignore transparent pixels.
        if ( !data[ index + 3 ] ) {
          continue;
        }

        pixels.push([
          j, i,
          r, g, b
        ]);
      }
    }

    // Sort.
    pixels.sort(function( a, b ) {
      // Red.
      var d = a[2] - b[2];
      if ( d ) { return d; }

      // Green.
      d = a[3] - b[3];
      if ( d ) { return d; }

      // Blue.
      d = a[4] - b[4];
      if ( d ) { return d; }

      return 0;
    });

    var scale = parseInt( scaleEl.value, 10 );
    var spaces = '    ';

    // To strings.
    var commands = [
      'var drawPixels = function(x, y) {',
      spaces + 'noStroke();'
    ];

    var pixel;
    r = null;
    g = null;
    b = null;
    for ( i = 0; i < pixels.length; i++ ) {
      pixel = pixels[i];

      if ( r !== pixel[2] ||
           g !== pixel[3] ||
           b !== pixel[4] ) {
        r = pixel[2];
        g = pixel[3];
        b = pixel[4];

        commands.push(
          spaces +
          'fill(' +
          r + ', ' +
          g + ', ' +
          b + ');'
        );
      }

      commands.push(
        spaces +
        'rect(' +
        'x + ' + ( pixel[0] * scale ) + ', ' +
        'y + ' + ( pixel[1] * scale ) + ', ' +
        scale + ', ' + scale + ');'
      );
    }

    commands.push( '};' );

    document.getElementById( 'export' ).value = commands.join( '\n' );
  }

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    image = new Image();
    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
    image.onload = function() {
      exportCommands( image );
    };
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

  var scaleEl = document.getElementById( 'scale' );
  scaleEl.addEventListener( 'change', function() {
    exportCommands( image );
  });

}) ( window, document );
