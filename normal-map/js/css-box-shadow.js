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

  /**
   * Canvas implementation of mattdesl's normal map shader.
   * https://github.com/mattdesl/lwjgl-basics/wiki/ShaderLesson6
   */
  var shaderFn = (function() {
    // Temporary canvas.
    var canvas = document.createElement( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    return function shaderFn( light, ambient, falloff, diffuse, normal ) {
      // Light position.
      var lx = light.x,
          ly = light.y,
          lz = light.z;

      // Light color.
      var lr = light.r,
          lg = light.g,
          lb = light.b,
          la = light.a;

      // Pre-multiply light color with intensity.
      lr *= la;
      lg *= la;
      lb *= la;

      // Ambient color.
      var ar = ambient.r,
          ag = ambient.g,
          ab = ambient.b,
          aa = ambient.a;

      // Pre-multiply ambient color with intensity.
      ar *= aa;
      ag *= aa;
      ab *= aa;

      // Falloff (attenuation coefficients).
      var fx = falloff.x,
          fy = falloff.y,
          fz = falloff.z;

      var diffuseData = diffuse.data,
          normalData  = normal.data;

      var imageData = ctx.createImageData( diffuse );

      var data   = imageData.data,
          width  = imageData.width,
          height = imageData.height;

      var x, y;
      var index;
      var dlx, dly, dlz;
      var D, Dinverse;
      // Normalized normal and light vectors.
      var Nr, Ng, Nb;
      var Lx, Ly, Lz;
      // N dot L.
      var NL;
      // Diffuse color.
      var dr, dg, db, da;
      // Normal color.
      var nr, ng, nb;
      // Length of normal vector (inverse).
      var ln;
      // Diffuse: light color * Lambertian reflection.
      var Dr, Dg, Db;
      // Attenuation and intensity color.
      var attenuation;
      var ir, ig, ib;
      for ( y = 0; y < height; y++ ) {
        for ( x = 0; x < width; x++ ) {
          index = 4 * ( y * width + x );

          dr = diffuseData[ index ];
          dg = diffuseData[ index + 1 ];
          db = diffuseData[ index + 2 ];
          da = diffuseData[ index + 3 ];

          nr = normalData[ index ];
          ng = normalData[ index + 1 ];
          nb = normalData[ index + 2 ];

          // Light delta position.
          dlx = lx - x;
          dly = ly - y;
          dlz = lz;

          // Light distance.
          D = Math.sqrt( dlx * dlx + dly * dly + dlz * dlz );

          // Normalize.
          nr = nr * 2 - 1;
          ng = ng * 2 - 1;
          nb = nb * 2 - 1;
          ln = 1 / Math.sqrt( nr * nr + ng * ng + nb * nb );

          Nr = nr * ln;
          Ng = ng * ln;
          Nb = nb * ln;

          Dinverse = 1 / D;
          Lx = dlx * Dinverse;
          Ly = dly * Dinverse;
          Lz = dlz * Dinverse;

          // N dot L.
          NL = Math.max( Nr * Lx + Ng * Ly + Nb * Lz, 0 );
          // Diffuse lighting factor.
          Dr = lr * NL;
          Dg = lg * NL;
          Db = lb * NL;

          attenuation = 1 / ( fx + ( fy * D ) + ( fz * D * D ) );

          // Intensity = Ambient + Diffuse * Attenuation.
          ir = ar + Dr * attenuation;
          ig = ag + Dg * attenuation;
          ib = ab + Db * attenuation;

          // Final color (diffuse color * intensity).
          data[ index     ] = dr * ir;
          data[ index + 1 ] = dg * ig;
          data[ index + 2 ] = db * ib;
          data[ index + 3 ] = da;
        }
      }

      return data;
    };
  }) ();

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
