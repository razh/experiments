/*globals $*/
$(function() {
  'use strict';

  var fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serf';

  var $editor = $( '#editor' ),
      $preview = $( '#preview' );

  $editor.css({
    'font-family': fontFamily
  });

  var $inputs = {
    fontWeight: $( 'input[name="font-weight"]' ),
    letterSpacing: $( 'input[name="letter-spacing"]' ),
    lineHeight: $( 'input[name="line-height"]' ),
    textAlign: $( 'select[name="text-align"]' )
  };

  // Get default config values from inputs.
  var config = Object.keys( $inputs ).reduce(function( object, key ) {
    object[ key ] = $inputs[ key ].val();
    return object;
  }, {} );

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
      .split( '\n' )
      .filter(function( string ) {
        // Remove any empty/whitespace-only strings.
        return string.trim().length > 0;
      });
  }

  var editorText = '';
  var editorTextArray = toTextArray( editorText );

  function updatePreview( textArray ) {
    $preview.empty();

    var previewWidth = $preview.width();

    // Configuration values.
    var fontWeight = config.fontWeight,
        letterSpacing = config.letterSpacing,
        lineHeight = config.lineHeight,
        textAlign = config.textAlign;

    function textWidthFontSize( text, fontSize ) {
      return textWidth( text, {
        'font-weight': fontWeight,
        'font-size': fontSize + 'px',
        'font-family': fontFamily,
        'letter-spacing': letterSpacing + 'px',
        'line-height': lineHeight
      });
    }

    textArray.forEach(function( text ) {
      // Binary search.
      var low = 0;
      var high = 512;
      var fontSize = high;
      var currentWidth;

      while ( low <= high ) {
        fontSize = Math.round( 0.5 * ( low + high ) );

        currentWidth = textWidthFontSize( text, fontSize );

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
        low          = textWidthFontSize( text, fontSize - 1 );
        currentWidth = textWidthFontSize( text, fontSize );
        high         = textWidthFontSize( text, fontSize + 1 );

        console.log( 'actual: ' + currentWidth + ', ' +
          'desired: ' + previewWidth +
          ', lo|hi: [' + low + ', ' + high + ']' +
          ', text: ' + text );
      }

      var $line = $( '<div>' + text + '</div>' );
      $line.css({
        'font-weight': fontWeight,
        'font-size': fontSize + 'px',
        'font-family': fontFamily,
        'letter-spacing': letterSpacing + 'px',
        'line-height': lineHeight,
        'text-align': textAlign
      });

      $preview.append( $line );
    });
  }

  function update() {
    var text = $editor.html();
    editorText = text;
    editorTextArray = toTextArray( editorText );
    console.log( editorTextArray );

    updatePreview( editorTextArray );
  }

  // Update on input change.
  Object.keys( $inputs ).forEach(function( key ) {
    var $input = $inputs[ key ];

    $input.on( 'change', function() {
      config[ key ] = $input.val();
      update();
    });
  });

  // Update when typing/resizing.
  $editor.on( 'input', update );
  $( window ).on( 'resize', update );

  // Initial render.
  update();
});
