/*exported DepthControls*/
var DepthControls = (function() {
  'use strict';

  var elements = [];
  var callbacks = {
    update: []
  };

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

    // Update all listeners.
    callbacks.update.map(function( callback ) { callback(); });
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

  function on( event, callback ) {
    var callbackFns = callbacks[ event ] || [];
    callbackFns.push( callback );
    callbacks[ event ] = callbackFns;
  }

  function off( event, callback ) {
    var callbackFns = callbacks[ event ];
    if ( !callbackFns ) {
      return;
    }

    var index = callbackFns.indexOf( callback );
    if ( index !== -1 ) {
      callbackFns.splice( index, 1 );
    }
  }

  window.addEventListener( 'wheel', onWheel );

  return {
    add: add,
    remove: remove,
    on: on,
    off: off
  };
}) ();
