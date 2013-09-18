/*globals $*/
(function( window, document, undefined ) {
  'use strict';

  // Measuring text height:
  // http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
  function verticalBounds( data, width, height ) {
    var first = false,
        last  = false,
        row   = height,
        col   = 0;

    var y;

    while ( !last && row ) {
      row--;
      for ( col = 0; col < width; col++ ) {
        if ( data[ row * width * 4 + col * 4 + 3 ] ) {
          last = row;
          break;
        }
      }
    }

    while ( row ) {
      row--;
      for ( col = 0; col < width; col++ ) {
        if ( data[ row * width * 4 + col * 4 + 3 ] ) {
          first = row;
          break;
        }
      }

      if ( first !== row ) {
        y = last - first;
        break;
      }
    }

    return {
      y: first,
      height: y
    };
  }

  $(function() {
    var $canvas = $( '#canvas' ),
        canvas  = $canvas[0],
        ctx     = canvas.getContext( '2d' );

    canvas.width = 1000;
    canvas.height = 30;

    var array = [];
    var i, j;
    for ( i = 32; i < 127; i++ ) {
      array.push(i);
    }

    ctx.font = '12px Courier';
    ctx.font = '12px Courier New';
    ctx.font = '12px Monaco';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    ctx.fillText( String.fromCharCode.apply( null, array ), 0, 0 );

    // var text = '[A*(]';
    var text = String.fromCharCode.apply( null, array );
    var metrics = ctx.measureText( text );
    console.log( 'width:' + metrics.width );

    // ctx.fillStyle = 'white';
    ctx.clearRect( 0, 0, canvas.width, canvas.height );

    ctx.fillStyle = 'black';
    ctx.fillText( text, 0, 0 );

    var charWidth = ctx.measureText( ' ' ).width;

    var width  = metrics.width,
        height = canvas.height;

    var imageData = ctx.getImageData( 0, 0, width, height );
    var data = imageData.data;

    var bounds = verticalBounds( data, width, height );
    var first = bounds.y;
    var last  = bounds.y + bounds.height;
    console.log( bounds.height );

    ctx.beginPath();

    ctx.rect( 0, first, width, 1 );
    ctx.rect( 0, last, width, 1 );

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();

    ctx.beginPath();
    for ( i = 0; i < text.length; i += 2 ) {
      ctx.rect( i * charWidth, first, charWidth, last );
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Okay, now determine the relative brightness of each character.
    ctx.clearRect( 0, 0, width, height );
    ctx.fillStyle = 'black';
    ctx.fillText( text, 0, 0 );

    var brightnessArray = [];
    var brightness;
    for ( i = 0; i < text.length; i++ ) {
      imageData = ctx.getImageData( i * charWidth, first, charWidth, last );
      data = imageData.data;

      brightness = 0;
      for ( j = 0; j < data.length; j += 4 ) {
        brightness += data[ j + 3 ];
      }

      brightnessArray[ text.charAt(i).charCodeAt(0) ] = brightness;
    }

    console.log( brightnessArray );

    var sortedBrightnessArray = brightnessArray.map(function( brightness, index ) {
      return {
        index: index,
        brightness: brightness,
        character: String.fromCharCode( index )
      };
    }).sort(function( a, b ) {
      return a.brightness - b.brightness;
    });

    console.log(sortedBrightnessArray.map(function( element ) {
      return element.character;
    }).reverse().join( '' ));

    // Visual diff.
    var diff = 0;
    var min = Number.POSITIVE_INFINITY;
    var minIndex;
    i = text.indexOf( '{' );
    var charData = ctx.getImageData( i * charWidth, first, charWidth, last ).data;
    for ( i = 0; i < text.length; i++ ) {
      imageData = ctx.getImageData( i * charWidth, first, charWidth, last );
      data = imageData.data;

      diff = 0;
      for ( j = 0; j < data.length; j += 4 ) {
        diff += Math.abs( data[ j + 3 ] - charData[ j + 3 ] );
      }

      if ( diff < min ) {
        min = diff;
        minIndex = i;
      }
    }

    console.log( min + ', ' + minIndex + ', ' + text.charAt( minIndex ) );

    // Now how about doing it with a inverted image.
    var $testCanvas = $( '#test-canvas' );
    var testCanvas = $testCanvas[0];
    var testCtx = testCanvas.getContext( '2d' );

    testCanvas.width = 100;
    testCanvas.height = 20;
    testCtx.clearRect( 0, 0, testCanvas.width, testCanvas.height );

    testCtx.font = ctx.font;
    testCtx.textBaseline = 'top';
    testCtx.fillStyle = 'white';
    testCtx.fillText( '{', 0, 0 );
    testCtx.fillText( '1', 2 * charWidth, 0 );

    testCtx.fillStyle = 'black';
    testCtx.fillText( '{', charWidth, 0 );
    testCtx.fillText( '1', 3 * charWidth, 0 );
    min = Number.POSITIVE_INFINITY;
    minIndex = null;
    var inverseData = testCtx.getImageData( 0, first, charWidth, last ).data;
    for ( i = 0; i < text.length; i++ ) {
      imageData = ctx.getImageData( i * charWidth, first, charWidth, last );
      data = imageData.data;

      diff = 0;
      for ( j = 0; j < data.length; j += 4 ) {
        diff += Math.abs( data[ j + 3 ] - inverseData[ j + 3 ] );
      }

      if ( diff < min ) {
        min = diff;
        minIndex = i;
      }
    }

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect( minIndex * charWidth, first, charWidth, last );

    testCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    testCtx.fillRect( 0, first, charWidth, last );

    console.log( min + ', ' + minIndex + ', ' + text.charAt( minIndex ) );
  });
}) ( window, document );
