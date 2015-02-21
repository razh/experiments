(function() {
  'use strict';

  var fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  var editor  = document.querySelector( '#editor' ),
      preview = document.querySelector( '#preview' );

  editor.style.fontFamily = fontFamily;

  var inputs = {
    fontWeight:    document.querySelector( '#font-weight'    ),
    letterSpacing: document.querySelector( '#letter-spacing' ),
    lineHeight:    document.querySelector( '#line-height'    ),
    textAlign:     document.querySelector( '#text-align'     )
  };

  // Get default config values from inputs.
  var config = Object.keys( inputs ).reduce(function( object, key ) {
    object[ key ] = inputs[ key ].value;
    return object;
  }, {} );

  function css( el, props ) {
    Object.keys( props ).forEach(function( key ) {
      el.style[ key ] = props[ key ];
    });
  }

  var textWidth = (function() {
    var div = document.createElement( 'div' );
    document.body.appendChild( div );

    css( div, {
      position: 'absolute',
      float: 'left',
      visibility: 'hidden',
      whiteSpace: 'nowrap'
    });

    return function( text, props ) {
      div.textContent = text;
      css( div, props );

      return div.getBoundingClientRect().width;
    };
  }) ();

  function toTextArray( text ) {
    // Utility functions.
    function trim( string ) {
      return string.trim();
    }

    function length( object ) {
      return object.length;
    }

    function removeTags( string ) {
      return string
        // Remove all line breaks.
        .replace( /<div><br><\/div>/gi, '' )
        // Add new lines at div start.
        .replace( /<div>/gi, '\n' )
        // Remove closing div tags.
        .replace( /<\/div>/gi, '' )
        // Replace line breaks.
        .replace( /<br>/gi, '\n' );
    }

    function unescape( string ) {
      return string
        .replace( /&nbsp;/g, ' ' )
        .replace( /&amp;/g, '&' )
        .replace( /&lt;/g, '<' )
        .replace( /&gt;/g, '>' )
        .replace( /&quot;/g, '"' )
        .replace( /&#039;/g, '\'' );
    }

    return removeTags( text )
      .split( '\n' )
      // Remove any empty/whitespace-only strings.
      .map( unescape )
      .map( trim )
      .filter( length );
  }

  var editorText = '';
  var editorTextArray = toTextArray( editorText );

  function updatePreview( textArray ) {
    preview.innerHTML = '';

    var previewWidth = preview.getBoundingClientRect().width;

    // Configuration values.
    var fontWeight = config.fontWeight,
        letterSpacing = config.letterSpacing,
        lineHeight = config.lineHeight,
        textAlign = config.textAlign;

    function textWidthFontSize( text, fontSize ) {
      return textWidth( text, {
        fontWeight: fontWeight,
        fontSize: fontSize + 'px',
        fontFamily: fontFamily,
        letterSpacing: letterSpacing + 'px',
        lineHeight: lineHeight
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

        console.log(
          'actual: ' + currentWidth + ', ' +
          'desired: ' + previewWidth + ', ' +
          '[lo, hi]: [' + low + ', ' + high + ']' + ', ' +
          'text: ' + text
        );
      }

      var line = document.createElement( 'div' );
      line.textContent = text;

      css( line, {
        fontWeight: fontWeight,
        fontSize: fontSize + 'px',
        fontFamily: fontFamily,
        letterSpacing: letterSpacing + 'px',
        lineHeight: lineHeight,
        textAlign: textAlign
      });

      preview.appendChild( line );
    });
  }

  function update() {
    editorText = editor.innerHTML;
    editorTextArray = toTextArray( editorText );
    console.log( editorTextArray );

    updatePreview( editorTextArray );
  }

  // Update on input change.
  Object.keys( inputs ).forEach(function( key ) {
    var input = inputs[ key ];

    input.addEventListener( 'change', function() {
      config[ key ] = input.value;
      update();
    });
  });

  // Update when typing/resizing.
  editor.addEventListener( 'input', update );
  window.addEventListener( 'resize', update );

  // Initial render.
  update();
}) ();
