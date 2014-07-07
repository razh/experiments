(function( window, documnet, undefined ) {
  'use strict';

  var config = {
    scale: 4,
    resolution: 64,

    light: {
      x: 0.8,
      y: 0.5,
      z: 0.1,

      r: 1.0,
      g: 0.9,
      b: 0.6,
      a: 1.0
    },

    ambient: {
      r: 0.5,
      g: 0.5,
      b: 0.3,
      a: 0.6
    },

    falloff: {
      x: 0.1,
      y: 0.5,
      z: 5
    }
  };

  var material = {
    diffuse: null,
    normal: null
  };

  var diffuseEl = document.querySelector( '.diffuse' );
  var normalEl = document.querySelector( '.normal' );

  // Canvas elements.
  var canvasGroup = document.querySelector( '.canvas-group' );

  var canvas = {};
  var context = {};

  [ 'diffuse', 'normal', 'output' ].forEach(function( key ) {
    var canvasEl = canvas[ key ] = document.createElement( 'canvas' );
    context[ key ] = canvasEl.getContext( '2d' );
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

  function drawOutput() {
    var imageData = shaderFn(
      context.output,
      config.light, config.ambient, config.falloff,
      material.diffuse, material.normal
    );

    tempCanvas.width  = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData( imageData, 0, 0 );

    var canvasSize = config.scale * config.resolution;
    canvas.output.width  = canvasSize;
    canvas.output.height = canvasSize;

    context.output.imageSmoothingEnabled = false;
    context.output.drawImage(
      tempCanvas,
      0, 0, tempCanvas.width, tempCanvas.height,
      0, 0, canvasSize, canvasSize
    );
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
  function shaderFn( ctx, light, ambient, falloff, diffuse, normal ) {
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

    var inverse255 = 1 / 255;

    var inverseWidth  = 1 / width,
        inverseHeight = 1 / height;

    var x, y;
    var index;
    // Normalized coordinates.
    var xt, yt;
    // Light distance.
    var dlx, dly, dlz;
    var D, Dinverse;
    // Normalized normal and light vectors.
    var Nr, Ng, Nb;
    var Lx, Ly, Lz;
    // Diffuse light intensity.
    var NdotL;
    // Diffuse color.
    var dr, dg, db, da;
    // Normal color.
    var nr, ng, nb;
    // Length of normal vector (inverse).
    var nl;
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

        nr = normalData[ index     ] * inverse255;
        ng = normalData[ index + 1 ] * inverse255;
        nb = normalData[ index + 2 ] * inverse255;

        // Normalize texel coordinates.
        xt = x * inverseWidth;
        yt = y * inverseHeight;

        // Light delta position.
        dlx = lx - xt;
        dly = ly - yt;
        dlz = lz;

        // Light distance.
        D = Math.sqrt( dlx * dlx + dly * dly + dlz * dlz );

        // Normalize normal vector.
        nr = nr * 2 - 1;
        ng = ng * 2 - 1;
        nb = nb * 2 - 1;
        nl = 1 / Math.sqrt( nr * nr + ng * ng + nb * nb );

        Nr = nr * nl;
        Ng = ng * nl;
        Nb = nb * nl;

        // Normalize light vector.
        Dinverse = 1 / D;
        Lx = dlx * Dinverse;
        Ly = dly * Dinverse;
        Lz = dlz * Dinverse;

        // Diffuse light intensity.
        NdotL = Math.max( Nr * Lx + Ng * Ly + Nb * Lz, 0 );
        Dr = lr * NdotL;
        Dg = lg * NdotL;
        Db = lb * NdotL;

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

    return imageData;
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

        if ( material.diffuse && material.normal ) {
          drawOutput();
        }
      }
    });
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

  canvas.output.addEventListener( 'mousemove', function( event ) {
    if ( !material.diffuse || !material.normal ) {
      return;
    }

    var output = canvas.output;
    var rect = output.getBoundingClientRect();

    config.light.x = ( event.pageX - rect.left ) / rect.width;
    config.light.y = ( event.pageY - rect.top  ) / rect.height;

    drawOutput();
  });

}) ( window, document );
