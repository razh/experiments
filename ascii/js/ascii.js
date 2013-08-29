/*globals $*/
(function( window, document, undefined ) {
  'use strict';

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

    var ymax = 0;

    var first = false,
        last = false,
        row = height,
        col = 0;

    // Measuring text height:
    // http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
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
        ymax = last - first;
        break;
      }
    }

    console.log(ymax);

    ctx.beginPath();

    ctx.rect( 0, first, width, 1 );
    ctx.rect( 0, last, width, 1 );

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();

    ctx.beginPath();
    for ( i = 0; i < text.length; i += 2 ) {
      ctx.rect( i * charWidth, first, charWidth, ymax );
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
      imageData = ctx.getImageData( i * charWidth, first, charWidth, ymax );
      data = imageData.data;

      brightness = 0;
      for ( j = 0; j < data.length; j += 4 ) {
        brightness += data[ j + 3 ];
      }

      brightnessArray[ text.charAt(i).charCodeAt(0) ] = brightness;
    }

    console.log(brightnessArray);

    // Visual diff.
    var diff = 0;
    var min = Number.POSITIVE_INFINITY;
    var minIndex;
    i = text.indexOf( '{' );
    var charData = ctx.getImageData( i * charWidth, first, charWidth, ymax ).data;
    for ( i = 0; i < text.length; i++ ) {
      imageData = ctx.getImageData( i * charWidth, first, charWidth, ymax );
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

    min = Number.POSITIVE_INFINITY;
    minIndex = null;
    var inverseData = testCtx.getImageData( 0, first, charWidth, ymax ).data;
    for ( i = 0; i < text.length; i++ ) {
      imageData = ctx.getImageData( i * charWidth, first, charWidth, ymax );
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

    testCtx.fillStyle = 'red';
    testCtx.fillRect( 0, first, charWidth, ymax );

    console.log( min + ', ' + minIndex + ', ' + text.charAt( minIndex ) );
  });
}) ( window, document );
