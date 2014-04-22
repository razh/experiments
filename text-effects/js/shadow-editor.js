(function( window, document, undefined ) {
  'use strict';

  var textElement = document.querySelector( '.text' );

  textElement.style.textShadow = (function() {
    var shadows = [];

    var count = 8;

    var x = 0,
        y = 0;

    var dx = 0.5,
        dy = 1;

    var i;
    for ( i = 0; i < count; i++ ) {
      x += dx;
      y += dy;
      shadows.push( x + 'px ' + y + 'px 0 #999' );
    }

    dx = -1.5;
    dy = 0.5;
    for ( i = 0; i < count; i++ ) {
      x += dx;
      y += dy;
      shadows.push( x + 'px ' + y + 'px 0 #555' );
    }

    return shadows.join( ', ' );
  }) ();
}) ( window, document );
