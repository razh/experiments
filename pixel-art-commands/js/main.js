/*globals URL*/
(function( window, document, undefined ) {
  'use strict';

  // Utility functions.
  function capitalize( str ) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  var canvas = document.createElement( 'canvas' ),
      ctx    = canvas.getContext( '2d' );

  var image;

  // Relative units.
  var originRatioX = 0,
      originRatioY = 0;

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
    var name = nameEl.value || 'Entity';
    var spaces = '    ';

    var constructorFn = [
      'var ' + name + ' = function(x, y) {',
      spaces + 'this.x = x || 0;',
      spaces + 'this.y = y || 0;',
      spaces + 'this.scaleX = 1;',
      spaces + 'this.scaleY = 1;',
      spaces + 'this.angle = 0;',
      spaces + 'this.originRatioX = ' + originRatioX + ';',
      spaces + 'this.originRatioY = ' + originRatioY + ';',
      spaces + 'this.pixelSize = ' + scale + ';',
      spaces + 'this.imageWidth = ' + image.width + ';',
      spaces + 'this.imageHeight = ' + image.height + ';',
      spaces + 'this.ctx = createGraphics(' +
        'this.imageWidth * this.pixelSize, ' +
        'this.imageHeight * this.pixelSize, ' +
      'RGB);',
      spaces + 'this.prerender();',
      '};'
    ];

    var prerenderFn = [
      name + '.prototype.prerender = function() {',
      spaces + 'var ctx = this.ctx;',
      spaces + 'ctx.beginDraw();',
      spaces + 'ctx.noStroke();',
      spaces + 'ctx.scale(this.pixelSize, this.pixelSize);',
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

        prerenderFn.push(
          spaces +
          'ctx.fill(' +
          r + ', ' +
          g + ', ' +
          b + ');'
        );
      }

      prerenderFn.push(
        spaces +
        'ctx.rect(' +
        pixel[0] + ', ' +
        pixel[1] + ', ' +
        '1, 1);'
      );
    }

    prerenderFn.push( spaces + 'ctx.endDraw();' );
    prerenderFn.push( '};' );

    var drawFn = [
      name + '.prototype.draw = function() {',
      spaces + 'pushMatrix();',
      spaces + 'translate(this.x, this.y);',
      spaces + 'rotate(this.angle);',
      spaces + 'scale(this.scaleX, this.scaleY);',
      spaces + 'translate(-this.originX, -this.originY);',
      spaces + 'image(this.ctx, 0, 0);',
      spaces + 'popMatrix();',
      '};'
    ];

    // TODO: Handle origin offsets. Fix scaling not working with origin.
    var toLocalFn = [
      name + '.prototype.toLocal = function(x, y) {',
      spaces + 'x -= this.x;',
      spaces + 'y -= this.y;',
      spaces + 'var angle = this.angle;',
      spaces + 'var c, s;',
      spaces + 'var rx, ry;',
      spaces + 'if (angle) {',
      spaces + spaces + 'c = cos(angle);',
      spaces + spaces + 's = sin(angle);',
      spaces + spaces + 'rx = c * x - s * y;',
      spaces + spaces + 'ry = s * x + c * y;',
      spaces + spaces + 'x = rx;',
      spaces + spaces + 'y = ry;',
      spaces + '}',
      spaces + 'return {',
      spaces + spaces + 'x: x / this.scaleX,',
      spaces + spaces + 'y: y / this.scaleY',
      spaces + '};',
      '};'
    ];

    function originFn( axis, dimension ) {
      axis = capitalize( axis );
      dimension = capitalize( dimension );

      return [
        'Object.defineProperty(' + name + '.prototype, \'origin' + axis + '\', {',
        spaces + 'get: function() {',
        spaces + spaces + 'return this.originRatio' + axis +
          ' * this.image' + dimension + ' * this.pixelSize;',
        spaces + '},',
        spaces + 'set: function(origin' + axis + ') {',
        spaces + spaces + 'this.originRatio' + axis +
          ' = origin' + axis + ' / (this.image' + dimension + ' * this.pixelSize);',
        spaces + '}',
        '});'
      ];
    }

    var commands = constructorFn
      .concat( prerenderFn )
      .concat( drawFn )
      .concat( toLocalFn )
      .concat( originFn( 'x', 'width' ) )
      .concat( originFn( 'y', 'height' ) );

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


  function exportImage() {
    exportCommands( image );
  }

  var scaleEl = document.getElementById( 'scale' );
  scaleEl.addEventListener( 'change', exportImage );

  var nameEl = document.getElementById( 'name' );
  nameEl.addEventListener( 'change', exportImage );

  // Handle origin change.
  function onOriginClick( event ) {
    var value = parseInt( event.currentTarget.value, 10 );

    /**
     * Order of origin elements:
     *   0  1  2
     *   3  4  5
     *   6  7  8
     */
    originRatioX = 0.5 * ( value % 3 );
    originRatioY = 0.5 * Math.floor( value / 3 );
    exportImage();
  }

  var originEls = [].slice.call( document.getElementsByName( 'origin' ) );
  originEls.forEach(function( el ) {
    el.addEventListener( 'click', onOriginClick );
  });

}) ( window, document );
