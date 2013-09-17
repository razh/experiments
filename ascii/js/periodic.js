(function( window, document, undefined ) {
  'use strict';

  function calculateBrightness( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var imageData = ctx.getImageData( 0, 0, width, height ).data;

    var brightness = 0;

    var i, il;
    var r, g, b, a;
    for ( i = 0, il = imageData.length; i < il; i += 4 ) {
      r = imageData[ i ];
      g = imageData[ i + 1 ];
      b = imageData[ i + 2 ];
      a = imageData[ i + 3 ];

      brightness += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    return brightness / ( width * height );
  }

  var normalCanvas  = document.getElementById( 'normal-canvas' ),
      normalContext = normalCanvas.getContext( '2d' );

  var diffCanvas  = document.getElementById( 'diff-canvas' ),
      diffContext = diffCanvas.getContext( '2d' );

  var logoCanvas = document.createElement( 'canvas' ),
      logoContext = logoCanvas.getContext( '2d' );

  var image = document.getElementById( 'periodic-img' );

  var WIDTH  = image.width  = normalCanvas.width  = diffCanvas.width  = 256,
      HEIGHT = image.height = normalCanvas.height = diffCanvas.height = 256;

  logoCanvas.width = WIDTH;
  logoCanvas.height = HEIGHT;

  function drawNormal( ctx, symbol, options ) {
    drawLogo( logoContext, symbol, options );
    ctx.drawImage( logoCanvas, 0, 0, WIDTH, HEIGHT );
  }

  function drawDiff( ctx, symbol, options ) {
    ctx.globalCompositeOperation = 'normal';

    ctx.clearRect( 0, 0, WIDTH, HEIGHT );
    ctx.drawImage( image, 0, 0, WIDTH, HEIGHT );

    ctx.globalCompositeOperation = 'difference';

    drawLogo( logoContext, symbol, options );
    ctx.drawImage( logoCanvas, 0, 0, WIDTH, HEIGHT );
  }

  function drawLogo( ctx, symbol, options ) {
    ctx.beginPath();
    ctx.rect( 4, 4, WIDTH - 8, HEIGHT - 8 );

    ctx.lineWidth = 8;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    var grad = ctx.createLinearGradient( 0, 0, WIDTH, HEIGHT );
    grad.addColorStop( 0, 'rgb(121, 184, 124)' );
    grad.addColorStop( 1, 'rgb(25, 38, 6)' );

    ctx.fillStyle = grad;
    ctx.fill();

    var el = elements.filter(function( element ) {
      return element.symbol === symbol;
    })[0];

    // Draw symbol.
    ctx.font = 'bold 130px Helvetica'; // Smaller font for wide symbols.
    ctx.font = 'bold 150px Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText( el.symbol, 0.5 * WIDTH, 0.5 * HEIGHT - 3 );

    ctx.textAlign = 'left';

    // Draw atomic mass.
    ctx.font = '21px Helvetica';
    ctx.fillText( el.atomicMass, 18, 30 );
    // Draw atomic number.
    ctx.font = '31px Helvetica';
    ctx.fillText( el.atomicNumber, 13, 195 );
    // Draw electron configuration.
    ctx.font = '20px Helvetica';
    ctx.fillText( el.electronConfiguration, 15, 230 );
    // Draw oxidation states.
    ctx.font = '21px Helvetica';
    ctx.textAlign = 'right';
    el.oxidationStates.forEach(function( state, index ) {
      ctx.fillText( state, 246, 30 + index * 25 );
    });
  }

  var elements = [];

  image.src = './img/br.png';
  image.onload = function() {
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', './json/elements.json', true );

    xhr.onreadystatechange = function() {
      if ( this.readyState === 4 && this.status === 200 ) {
        elements = JSON.parse( this.responseText );

        var symbol = 'Br';
        drawNormal( normalContext, symbol );
        drawDiff( diffContext, symbol );

        console.log( 'norm: ' + calculateBrightness( normalContext ) );
        console.log( 'diff: ' + calculateBrightness( diffContext ) );

        var current = 12.7373641815189;
        console.log( current - calculateBrightness( diffContext ) );
      }
    };

    xhr.send();
  };
}) ( window, document );
