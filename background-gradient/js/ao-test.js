(function( window, document, undefined ) {
  'use strict';

  var imageCanvas, imageContext;
  var gradientCanvas, gradientContext;
  var diffCanvas, diffContext;

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

    imageCanvas.width  = WIDTH;
    imageCanvas.height = HEIGHT;

    gradientCanvas.width  = WIDTH;
    gradientCanvas.height = HEIGHT;

    diffCanvas.width  = WIDTH;
    diffCanvas.height = HEIGHT;

    function drawGradient( ctx ) {
      ctx.beginPath();
      ctx.rect( 0, 0, WIDTH, HEIGHT );

      var grad = ctx.createLinearGradient( 0, 0, WIDTH, 0 );
      grad.addColorStop( 0.00, 'rgb(116,  45,  43)' );
      grad.addColorStop( 0.06, 'rgb(168,  82,  41)' );
      grad.addColorStop( 0.35, 'rgb(211, 112,  56)' );
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

    image.src= './img/ao_gradient_test.png';
    image.onload = function() {
      drawImage( imageContext );
      drawGradient( gradientContext );
      drawDiff( diffContext );
      console.log( averageCanvas( diffContext ) );
    };
  }) ();
}) ( window, document );
