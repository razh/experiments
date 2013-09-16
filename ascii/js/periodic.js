(function( window, document, undefined ) {
  'use strict';

  var normalCanvas  = document.getElementById( 'normal-canvas' ),
      normalContext = normalCanvas.getContext( '2d' );

  var diffCanvas  = document.getElementById( 'diff-canvas' ),
      diffContext = diffCanvas.getContext( '2d' );

  var image = document.getElementById( 'periodic-img' );

  var WIDTH  = image.width  = normalCanvas.width  = diffCanvas.width  = 256,
      HEIGHT = image.height = normalCanvas.height = diffCanvas.height = 256;

  function drawNormal( ctx ) {
    drawLogo( ctx );
  }

  function drawDiff( ctx ) {
    ctx.globalCompositeOperation = 'normal';

    ctx.clearRect( 0, 0, WIDTH, HEIGHT );
    ctx.drawImage( image, 0, 0, WIDTH, HEIGHT );

    ctx.globalCompositeOperation = 'difference';
    drawLogo( ctx );
  }

  function drawLogo( ctx ) {
    ctx.beginPath();
    ctx.rect( 3, 3, WIDTH - 6, HEIGHT - 6 );

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    var grad = ctx.createLinearGradient( 0, 0, WIDTH, HEIGHT );
    grad.addColorStop( 0, '#6F9969' );
    grad.addColorStop( 1, '#202E11' );

    ctx.fillStyle = grad;
    ctx.fill();

    var br = elements.filter(function( element ) {
      return element.symbol === 'Br';
    })[0];

    // Draw symbol.
    ctx.font = 'bold 110pt Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FCFBFF';
    ctx.fillText( br.symbol, 0.5 * WIDTH, 0.5 * HEIGHT - 3 );

    ctx.textAlign = 'left';

    // Draw atomic mass.
    ctx.font = '16pt Helvetica';
    ctx.fillText( br.atomicMass, 18, 30 );
    // Draw atomic number.
    ctx.font = '23pt Helvetica';
    ctx.fillText( br.atomicNumber, 13, 196 );
    // Draw electron configuration.
    ctx.font = '15pt Helvetica';
    ctx.fillText( br.electronConfiguration, 15, 230 );
    // Draw oxidation states.
    ctx.font = '16pt Helvetica';
    ctx.fillText( '-1', 228, 30 );
    ctx.fillText( '+1', 223, 54 );
    ctx.fillText( '+5', 223, 80 );
  }

  var elements = [];

  image.src = './img/br.png';
  image.onload = function() {
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', './json/elements.json', true );

    xhr.onreadystatechange = function() {
      if ( this.readyState === 4 && this.status === 200 ) {
        elements = JSON.parse( this.responseText );
        drawNormal( normalContext );
        drawDiff( diffContext );
      }
    };

    xhr.send();
  };
}) ( window, document );
