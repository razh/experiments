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
    var i;
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

    ctx.beginPath();
    ctx.moveTo( 0, first );
    ctx.lineTo( width, first );

    ctx.moveTo( 0, last );
    ctx.lineTo( width, last );
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.stroke();

    console.log(ymax);
  });
}) ( window, document );
