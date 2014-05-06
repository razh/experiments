/*exported DepthControls*/
var DepthControls = (function() {
  'use strict';

  var elements = [];

  function onWheel( event ) {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();

    var dy = event.deltaY;
    elements.forEach(function( element ) {
      element.z -= dy;
      element.setTransform();
    });
  }

  function add() {
    elements.push.apply( elements, arguments );
  }

  function remove() {
    var index;
    for ( var i = 0, il = arguments.length; i < il; i++ ) {
      index = elements.indexOf( arguments[i] );
      if ( index !== -1 ) {
        elements.splice( index, 1 );
      }
    }
  }

  function on() {
    window.addEventListener( 'wheel', onWheel );
  }

  function off() {
    window.removeEventListener( 'wheel', onWheel );
  }

  return {
    add: add,
    remove: remove,
    on: on,
    off: off
  };
}) ();
