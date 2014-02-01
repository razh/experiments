/**
 * Applies mouse-based 360-degree vertical and horizontal rotation to
 * all '.rotatable' elements in the document.
 */
(function( window, document, undefined ) {
  'use strict';

  var els = [].slice.call( document.querySelectorAll( '.rotatable' ) );

  // Add basic user interaction.
  function rotate( rx, ry ) {
    var transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';

    els.forEach(function( el ) {
      el.style.webkitTransform = transform;
      el.style.transform = transform;
    });
  }

  function onMouseMove( event ) {
    if ( !event.shiftKey ) {
      return;
    }

    var rx = -( event.clientY / window.innerHeight - 0.5 ) * 360,
        ry =  ( event.clientX / window.innerWidth  - 0.5 ) * 360;

    rotate( rx, ry );
  }

  window.addEventListener( 'mousemove', onMouseMove );

  document.addEventListener( 'keydown', function( event ) {
    // R.
    if ( event.which === 82 ) {
      rotate( 0, 0 );
    }
  });

}) ( window, document );
