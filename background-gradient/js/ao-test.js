(function( window, document, undefined ) {
  'use strict';

  var imageCanvas, imageContext;
  var gradientCanvas, gradientContext;
  var diffCanvas, diffContext;
  var channelCanvas, channelContext;

  var image;

  var WIDTH  = 119,
      HEIGHT = 20;

  (function init() {
    image = document.getElementById( 'ao-img' );

    imageCanvas  = document.getElementById( 'image-canvas' );
    imageContext = imageCanvas.getContext( '2d' );

    gradientCanvas  = document.getElementById( 'gradient-canvas' );
    gradientContext = gradientCanvas.getContext( '2d' );

    diffCanvas  = document.getElementById( 'diff-canvas' );
    diffContext = diffCanvas.getContext( '2d' );

    channelCanvas  = document.getElementById( 'channel-canvas' );
    channelContext = channelCanvas.getContext( '2d' );

    [
      imageCanvas,
      gradientCanvas,
      diffCanvas,
      channelCanvas
    ].forEach(function( canvas ) {
      canvas.width  = WIDTH;
      canvas.height = HEIGHT;
    });

    channelCanvas.height = 64;

    function drawGradient( ctx ) {
      ctx.beginPath();
      ctx.rect( 0, 0, WIDTH, HEIGHT );

      var grad = ctx.createLinearGradient( 0, 0, WIDTH, 0 );
      grad.addColorStop( 0.00, 'rgb(112,  41,  41)' );
      grad.addColorStop( 0.02, 'rgb(135,  59,  47)' );
      grad.addColorStop( 0.07, 'rgb(167,  83,  41)' );
      grad.addColorStop( 0.34, 'rgb(205, 112,  57)' );
      grad.addColorStop( 0.72, 'rgb(216, 128,  57)' );
      grad.addColorStop( 1.00, 'rgb(203, 112,  55)' );

      ctx.fillStyle = grad;
      ctx.fill();
    }

    function drawImage( ctx ) {
      ctx.drawImage( image, 0, 0, WIDTH, HEIGHT );
    }

    function drawDiff( ctx ) {
      ctx.clearRect( 0, 0, WIDTH, HEIGHT );
      drawImage( ctx );

      ctx.globalCompositeOperation = 'difference';

      drawGradient( ctx );

      ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Get average pixel value of a canvas 2d context.
     */
    function averageCanvas( ctx ) {
      var width  = ctx.canvas.width,
          height = ctx.canvas.height;

      var imageData = ctx.getImageData( 0, 0, width, height ).data;

      var sum = 0;

      var i, il;
      // Add the RGB values.
      for ( i = 0, il = imageData.length; i < il; i += 4 ) {
        sum += imageData[ i ];
        sum += imageData[ i + 1 ];
        sum += imageData[ i + 2 ];
      }

      return sum / ( width * height );
    }

    /**
     * Graph channel along x-axis.
     */
    function graphChannel( graphCtx, inputCtx, offset ) {
      var graphWidth  = graphCtx.canvas.width,
          graphHeight = graphCtx.canvas.height;

      var inputWidth  = inputCtx.canvas.width,
          inputHeight = inputCtx.canvas.height;

      var graphImageData = graphCtx.getImageData( 0, 0, graphWidth, graphHeight );
      var inputData = inputCtx.getImageData( 0, 0, inputWidth, inputHeight ).data;

      var graphData = graphImageData.data;

      var i, il;
      var index;
      var value, height;
      // Plot color of each column.
      for ( i = 0, il = 4 * inputWidth; i < il; i += 4 ) {
        value = inputData[ i + offset ];
        height = graphHeight - Math.round( value / 255 * graphHeight );

        // Calculate index of pixel at (i, height).
        index = i + 4 * ( graphWidth * height );
        graphData[ index + offset ] = value;
        graphData[ index + 3 ] = 255;
      }

      graphCtx.putImageData( graphImageData, 0, 0 );
    }

    image.src= './img/ao_gradient_test.png';
    image.onload = function() {
      drawImage( imageContext );
      drawGradient( gradientContext );
      drawDiff( diffContext );
      console.log( averageCanvas( diffContext ) );

      channelContext.fillStyle = '#000';
      channelContext.fillRect( 0, 0, channelCanvas.width, channelCanvas.height );
      graphChannel( channelContext, gradientContext, 0 );
      graphChannel( channelContext, gradientContext, 1 );
      graphChannel( channelContext, gradientContext, 2 );
    };
  }) ();
}) ( window, document );
