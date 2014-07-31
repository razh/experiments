/*jshint bitwise:false*/
/*exported Color*/
var Color = (function() {
  'use strict';

  var Color = {
    red: function( color ) {
      return color >> 16;
    },

    green: function( color ) {
      return ( color >> 8 ) & 0xFF;
    },

    blue: function( color ) {
      return color & 0xFF;
    },

    rgb: function( red, green, blue ) {
      return ( red << 16 ) | ( green << 8 ) | blue;
    }
  };

  return Color;

}) ();
