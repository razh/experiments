/*globals define*/
define(function() {
  'use strict';

  var keys = [];

  function onKeyDown( event ) {
    event.preventDefault();
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
