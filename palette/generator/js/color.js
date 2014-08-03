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

  // From SkRGBToHSV in Skia's SkColor.cpp.
  // https://github.com/google/skia/blob/master/src/core/SkColor.cpp
  function RGBtoHSV( red, green, blue, hsv ) {
    var min = Math.min( red, green, blue );
    var max = Math.max( red, green, blue );
    var delta = max - min;

    var v = max / 255;

    // Shade of gray.
    if ( !delta ) {
      hsv[0] = 0;
      hsv[1] = 0;
      hsv[2] = v;
      return hsv;
    }

    var s = delta / max;
    var h;
    if ( red === max ) {
      h = ( green - blue ) / delta;
    } else if ( green === max ) {
      h = 2 + ( ( blue - red ) / delta );
    } else {
      // blue === max.
      h = 4 + ( ( red - green ) / delta );
    }

    h *= 60;
    if ( h < 0 ) {
      h += 360;
    }

    hsv[0] = h;
    hsv[1] = s;
    hsv[2] = v;

    return hsv;
  }

  return {
    BLACK: BLACK,
    WHITE: WHITE,

    red: red,
    green: green,
    blue: blue,
    rgb: rgb,

    RGBtoHSV: RGBtoHSV
  };

}) ();
