/*globals $*/
$(function() {
  'use strict';

  var $editor = $( '#editor' ),
      $preview = $( '#preview' );

  // Inputs.
  var $fontWeightInput    = $( 'input[name="font-weight"]' ),
      $letterSpacingInput = $( 'input[name="letter-spacing"]' ),
      $lineHeightInput    = $( 'input[name="line-height"]' );

  var fontWeight    = $fontWeightInput.val(),
      letterSpacing = $letterSpacingInput.val(),
      lineHeight    = $lineHeightInput.val();

  var textWidth = (function() {
    var div = $( '<div></div>' )
      .css({
        position: 'absolute',
        float: 'left',
        visibility: 'hidden',
        'white-space': 'nowrap'
      })
      .appendTo( $( 'body' ) );

    return function( text, options ) {
      div.text( text );
      div.css( options );

      return div.width();
    };
  }) ();

  function toTextArray( text ) {
    return text.replace( /<div><br><\/div>/gi, '' ) // Remove all line breaks.
      .replace( /<div>/gi, '\n' ) // Add new lines where at div start.
      .replace( /<\/div>/gi, '' ) // Remove closing div tag.
      .replace( /&nbsp;/g, '' ) // Remove nbsps.
      .split( '\n' );
  }

  var editorText = '';
  var editorTextArray = toTextArray( editorText );

  function updatePreview( textArray ) {
    $preview.empty();

    var previewWidth = $preview.width();

    textArray.forEach(function( text ) {
      // Binary search.
      var low = 0;
      var high = 512;
      var fontSize = high;
      var currentWidth;

      while ( low <= high ) {
        fontSize = Math.round( 0.5 * ( low + high ) );

        currentWidth = textWidth( text, {
          'font-weight': fontWeight,
          'font-size': fontSize + 'px',
          'font-family': 'Helvetica Neue',
          'letter-spacing': letterSpacing + 'px',
          'line-height': lineHeight
        });

        if ( currentWidth < previewWidth ) {
          low = fontSize + 1;
        } else if ( currentWidth > previewWidth ) {
          high = fontSize - 1;
        } else {
          break;
        }
      }

      if ( currentWidth > previewWidth ) {
        fontSize--;
      }

      if ( currentWidth !== previewWidth ) {
        low = textWidth( text, {
          'font-weight': fontWeight,
          'font-size': ( fontSize - 1) + 'px',
          'font-family': 'Helvetica Neue',
          'letter-spacing': letterSpacing + 'px',
          'line-height': lineHeight
        });

        high = textWidth( text, {
          'font-weight': fontWeight,
          'font-size': ( fontSize + 1) + 'px',
          'font-family': 'Helvetica Neue',
          'letter-spacing': letterSpacing + 'px',
          'line-height': lineHeight
        });

        console.log(currentWidth + ', ' + previewWidth + ', [' + low + ', ' + high + ']');
      }

      var $line = $( '<div>' + text + '</div>' );
      $line.css({
        'font-weight': fontWeight,
        'font-size': fontSize + 'px',
        'font-family': 'Helvetica Neue',
        'letter-spacing': letterSpacing + 'px',
        'line-height': lineHeight
      });

      $preview.append( $line );
    });
  }

  function update() {
    var text = $editor.html();
    editorText = text;
    editorTextArray = toTextArray( editorText );
    console.log(editorTextArray);

    updatePreview( editorTextArray );
  }

  update();
  $editor.on('input', update );

  $fontWeightInput.on( 'change', function() {
    fontWeight = $fontWeightInput.val();
    update();
  });

  $letterSpacingInput.on( 'change', function() {
    letterSpacing = $letterSpacingInput.val();
    update();
  });

  $lineHeightInput.on( 'change', function() {
    lineHeight = $lineHeightInput.val();
    update();
  });
});
