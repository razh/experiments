/*globals Spring*/
(function( window, document, undefined ) {
  'use strict';

  var inputs = {
    tension: document.querySelector( '#tension' ),
    friction: document.querySelector( '#friction' )
  };

  var element = document.querySelector( '.spring' );

  var spring = new Spring();

  window.addEventListener( 'mousedown', function( event ) {
    var transform = 'translate3d(' +
      event.pageX + 'px, ' +
      event.pageY + 'px, 0)';

    element.style.webkitTransform = transform;
    element.style.transform = transform;
  });

}) ( window, document );
