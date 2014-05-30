/*globals define*/
define(function() {
  'use strict';

  var mouse = {
    x: 0,
    y: 0,

    px: 0,
    py: 0,

    down: false
  };

  function onMouseDown( event ) {
    mouse.px = mouse.x;
    mouse.py = mouse.y;

    mouse.x = event.pageX;
    mouse.y = event.pageY;

    mouse.down = true;
  }

  function onMouseMove( event ) {
    mouse.px = mouse.x;
    mouse.py = mouse.y;

    mouse.x = event.pageX;
    mouse.y = event.pageY;
  }

  function onMouseUp() {
    mouse.down = false;
  }

  function onTouchStart( event ) {
    onMouseDown( event.touches[0] );
  }

  function onTouchMove( event ) {
    event.preventDefault();
    onMouseMove( event.touches[0] );
  }

  var keys = [];

  function onKeyDown( event ) {
    keys[ event.which ] = true;
  }

  function onKeyUp( event ) {
    keys[ event.which ] = false;
  }

  return {
    mouse: mouse,
    onMouseDown: onMouseDown,
    onMouseMove: onMouseMove,
    onMouseUp: onMouseUp,

    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,

    keys: keys,
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp
  };
});
