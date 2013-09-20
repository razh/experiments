/*globals $*/
$(function() {
  'use strict';

  var $editor = $( '#editor' ),
      $preview = $( '#preview' );

  var textWidth = (function() {
    var div = $( '<div></div>' )
      .css({
        position: 'absolute',
        float: 'left',
        visibility: 'hidden',
        'white-space': 'nowrap'
      })
      .appendTo( $( 'body' ) );

    return function( text, font ) {
      div.text( text );
      div.css( 'font', font );

      return div.width();
    };
  }) ();

  var editorText = $editor.html();

  function toTextArray( text ) {
    return text.replace( /<div><br><\/div>/gi, '' ) // Remove all line breaks.
      .replace( /<div>/gi, '\n' ) // Add new lines where at div start.
      .replace( /<\/div>/gi, '' ) // Remove closing div tag.
      .split( '\n' );
  }

  var editorTextArray = toTextArray( editorText );

  $editor.on('input', function() {
    var text = $editor.html();
    if ( editorText !== text ) {
      editorText = text;
      editorTextArray = toTextArray( editorText );
      console.log(editorTextArray);

      updatePreview( editorTextArray );
    }
  });

  function updatePreview( textArray ) {
    $preview.empty();

    var previewWidth = $preview.width() - 20;

    textArray.forEach(function( text ) {
      // Suboptimal linear search for correct size.
      var fontSize = 128;

      while ( previewWidth < textWidth( text, fontSize + 'px Helvetica' ) ) {
        fontSize--;
      }

      var $line = $( '<div>' + text + '</div>' );
      $line.css( 'font', fontSize + 'px Helvetica' );

      $preview.append( $line );
    });
  }
});
