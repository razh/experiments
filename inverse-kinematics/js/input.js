/*exported Input*/
var Input = (function() {
  'use strict';

  function on( listener ) {
    function touchListener( event ) {
      listener( event.touches[0] );
    }

    if ( 'ontouchstart' in window ) {
      window.addEventListener( 'touchstart', touchListener );
      window.addEventListener( 'touchmove', function( event ) {
        event.preventDefault();
        touchListener( event );
      });
    } else {
      window.addEventListener( 'mousedown', listener );
      window.addEventListener( 'mousemove', listener );
    }
  }

  return {
    on: on
  };

}) ();
