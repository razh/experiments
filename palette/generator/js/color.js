/*jshint bitwise:false*/
/*exported Color*/
var Color = (function() {
  'use strict';

  var BLACK = 0x000000;
  var WHITE = 0xFFFFFF;

  function red( color ) {
    return color >> 16;
  }

  function green( color ) {
    return ( color >> 8 ) & 0xFF;
  }

  function blue( color ) {
    return color & 0xFF;
  }

  function rgb( red, green, blue ) {
    return ( red << 16 ) | ( green << 8 ) | blue;
  }

  return {
    BLACK: BLACK,
    WHITE: WHITE,

    red: red,
    green: green,
    blue: blue,
    rgb: rgb
  };

}) ();
