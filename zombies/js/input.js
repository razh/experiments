/*globals define*/
define(function() {
  'use strict';

  var keys = [];

  // Keys that are used.
  var validKeys = [
    // WASD.
    87, 65, 83, 68,
    // Arrow keys.
    37, 38, 39, 40,
    // Space.
    32
  ];

  function onKeyDown( event ) {
    if ( validKeys.indexOf( event.which ) !== -1 ) {
      event.preventDefault();
    }

    // console.log( event.which );
    keys[ event.which ] = true;
  }

  function onKeyUp( event ) {
    event.preventDefault();
    // console.log( event.which );
    keys[ event.which ] = false;
  }

  return {
    keys: keys,

    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp
  };
});
