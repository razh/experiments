(function( window, documnet, undefined ) {
  'use strict';

  var config = {
    scale: 4,
    resolution: 32
  };

  var material = {
    diffuse: null,
    normal: null
  };

  var diffuseEl = document.querySelector( '.diffuse' );
  var normalEl = document.querySelector( '.normal' );

  // Canvas elements.
  var canvasGroup = document.querySelector( '.canvas-group' );

  var canvas = {
    diffuse: document.createElement( 'canvas' ),
    normal: document.createElement( 'canvas' )
  };

  var context = {
    diffuse: canvas.diffuse.getContext( '2d' ),
    normal: canvas.normal.getContext( '2d' )
  };

  Object.keys( canvas ).forEach(function( key ) {
    var canvasEl = canvas[ key ];
    canvasEl.width  = 0;
    canvasEl.height = 0;
    canvasGroup.appendChild( canvasEl );
  });

  var tempCanvas = document.createElement( 'canvas' ),
      tempCtx    = tempCanvas.getContext( '2d' );

  function drawImage( image, ctx ) {
    var naturalWidth  = image.naturalWidth,
        naturalHeight = image.naturalHeight;

    var imageSize = Math.max( naturalWidth, naturalHeight );
    var resolution = config.resolution;
    var canvasSize = config.scale * resolution;

    ctx.canvas.width  = canvasSize;
    ctx.canvas.height = canvasSize;

    tempCanvas.width  = resolution;
    tempCanvas.height = resolution;

    // Scale down image on temporary canvas.
    tempCtx.drawImage(
      image,
      0, 0, imageSize, imageSize,
      0, 0, resolution, resolution
    );

    // Draw pixelated image on display canvas.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      tempCanvas,
      0, 0, resolution, resolution,
      0, 0, canvasSize, canvasSize
    );

    return tempCtx.getImageData( 0, 0, resolution, resolution );
  }

  /**
   * Converts an ImageData object (width, height, data: Uint8ClampedArray) to
   * a CSS box-shadow value.
   */
  function boxShadow( imageData, scale ) {
    scale = scale || 1;

    var width  = imageData.width,
        height = imageData.height;

    var data = imageData.data;
    var shadows = [];
    var x, y;
    var r, g, b, a;
    var index = 0;
    for ( y = 0; y < height; y++ ) {
      for ( x = 0; x < width; x++ ) {
        index = 4 * ( y * width + x );

        r = data[ index ];
        g = data[ index + 1 ];
        b = data[ index + 2 ];
        a = data[ index + 3 ];

        if ( !a ) {
          continue;
        }

        shadows.push(
          ( x * scale ) + 'px ' +
          ( y * scale ) + 'px ' +
          'rgba(' +
            r + ', ' +
            g + ', ' +
            b + ', ' +
            ( a / 255 ) +
          ')'
        );
      }
    }

    return shadows.join( ', ' );
  }

  // Input.
  var inputs = {
    scale: document.querySelector( '#scale' ),
    resolution: document.querySelector( '#resolution' )
  };

  Object.keys( inputs ).forEach(function( key ) {
    var input = inputs[ key ];
    input.value = config[ key ];
    input.addEventListener( 'input', function() {
      config[ key ] = parseInt( input.value, 10 );
    });
  });

  // Drag and drop.
  function onDrop( event, callback ) {
    var image = new Image();
    image.onload = callback.bind( image );
    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
  }

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    var target = event.target;
    onDrop( event, function() {
      var id;
      if ( target === diffuseEl || target === normalEl ) {
        id = target.id;
        target.style.backgroundImage = 'url(' + this.src + ')';
        material[ id ] = drawImage( this, context[ id ] );
      }
    });
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

}) ( window, document );
