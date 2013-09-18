(function( window, document, undefined ) {
  'use strict';

  function brightnessRGB( r, g, b ) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  (function() {
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

        brightness += brightnessRGB( r, g, b );
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

    function drawNormal( ctx, symbol ) {
      drawLogo( logoContext, symbol );
      ctx.drawImage( logoCanvas, 0, 0, WIDTH, HEIGHT );
    }

    function drawDiff( ctx, symbol ) {
      ctx.globalCompositeOperation = 'normal';

      ctx.clearRect( 0, 0, WIDTH, HEIGHT );
      ctx.drawImage( image, 0, 0, WIDTH, HEIGHT );

      ctx.globalCompositeOperation = 'difference';

      drawLogo( logoContext, symbol );
      ctx.drawImage( logoCanvas, 0, 0, WIDTH, HEIGHT );
    }

    function drawLogo( ctx, symbol ) {
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

    function symbolBrightness() {
      var brightnessArray = [];

      var testCanvas = document.createElement( 'canvas' ),
          testCtx    = testCanvas.getContext( '2d' );

      testCanvas.width = 256;
      testCanvas.height = 256;

      elements.forEach(function( element ) {
        testCtx.clearRect( 0, 0, testCtx.canvas.width, testCtx.canvas.height );
        drawLogo( testCtx, element.symbol );
        brightnessArray.push({
          symbol: element.symbol,
          brightness: calculateBrightness( testCtx )
        });
      });

      return brightnessArray;
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

          console.log( symbolBrightness().sort(function( a, b ) {
            return a.brightness - b.brightness;
          }).map(function( element ) {
            return element.symbol + ': ' + Math.round( element.brightness );
          }).join( ', ' ));
        }
      };

      xhr.send();
    };
  }) ();

  /**
   * Given an canvas context, calculate the intensities of a given region size
   * and dispaly them.
   */
  function partitionBrightness( ctx, width, height ) {
    var imageData = ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height ),
        data = imageData.data;

    var WIDTH = imageData.width,
        HEIGHT = imageData.height;

    var xCount = Math.ceil( WIDTH / width ),
        yCount = Math.ceil( HEIGHT / height );

    var brightnessArray = [],
        countArray = [];

    var i, j;
    var brightnessRow,
        countRow;

    for ( i = 0; i < xCount; i++ ) {
      brightnessRow = [];
      countRow = [];

      for ( j = 0; j < yCount; j++ ) {
        brightnessRow.push(0);
        countRow.push(0);
      }

      brightnessArray.push( brightnessRow );
      countArray.push( countRow );
    }

    var index;
    var xIndex, yIndex;
    var r, g, b;
    for ( i = 0; i < WIDTH; i++ ) {
      for ( j = 0; j < HEIGHT; j++ ) {
        index = 4 * ( WIDTH * j + i );
        xIndex = Math.floor( i / width );
        yIndex = Math.floor( j / height );
        countArray[ xIndex ][ yIndex ]++;

        r = data[ index ];
        g = data[ index + 1 ];
        b = data[ index + 2 ];

        brightnessArray[ xIndex ][ yIndex ] += brightnessRGB( r, g, b );
      }
    }

    var il, jl;
    for ( i = 0, il = brightnessArray.length; i < il; i++ ) {
      for ( j = 0, jl = brightnessArray[i].length; j < jl; j++ ) {
        brightnessArray[i][j] /= countArray[i][j];
      }
    }

    return brightnessArray;
  }

  function drawBrightnessArray( ctx, array, width, height) {
    array.forEach(function( row, rowIndex ) {
      row.forEach(function( col, colIndex ) {
        ctx.beginPath();
        ctx.rect( rowIndex * width, colIndex * height, width, height );
        ctx.fillStyle = 'hsl(0, 0%, ' + 100 * ( col / 255 ) + '%)';
        ctx.fill();
      });
    });
  }

  function drawBrightnessASCII( ctx, array, width, height ) {
    ctx.fillStyle = 'white';
    ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.font = height + 'px Monaco';
    ctx.fillStyle = 'black';

    var chars = '@80GCLft1i;:,. ';

    var index;

    var min = Number.POSITIVE_INFINITY,
        max = Number.NEGATIVE_INFINITY;

    array.forEach(function( row ) {
      row.forEach(function( col ) {
        if ( col < min ) {
          min = col;
        }

        if ( col > max ) {
          max = col;
        }
      });
    });

    var bins = [];
    array.forEach(function( row, rowIndex ) {
      row.forEach(function( col, colIndex ) {
        index = Math.round( chars.length * ( ( col - min ) / ( max - min ) ) );
        if ( typeof bins[index] === 'undefined' ) {
          bins[index] = 0;
        }
        bins[index]++;

        ctx.fillText( chars.charAt( index ), rowIndex * width, colIndex * height );
      });
    });

    console.log( bins );
  }

  (function() {
    var canvas = document.getElementById( 'brightness-canvas' ),
        context = canvas.getContext( '2d' );

    canvas.width = 256;
    canvas.height = 256;

    var asciiCanvas = document.getElementById( 'ascii-canvas' ),
        asciiContext = asciiCanvas.getContext( '2d' );

    asciiCanvas.width = 512;
    asciiCanvas.height = 512;

    function draw( ctx, image ) {
      ctx.clearRect( 0, 0, canvas.width, canvas.height );
      ctx.drawImage( image, 0, 0, canvas.width, canvas.height );
    }

    var image = new Image();
    image.src = './img/br.png';
    image.onload = function() {
      var width  = 4,
          height = 4;

      draw( context, image );

      var brightnessArray = partitionBrightness( context, width, height );
      drawBrightnessArray( context, brightnessArray, width, height );
      drawBrightnessASCII( asciiContext, brightnessArray, 8, 8 );
    };
  }) ();

}) ( window, document );
