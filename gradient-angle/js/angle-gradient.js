/*exported angleGradient*/
var angleGradient = (function() {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  var decimalRegexPrefix = '^' +
    '(' +
      // Minus sign (optional).
      '(-)?' +
      // Integer.
      '\\d+' +
      // Decimal (optional).
      '(\\.\\d+)?' +
    ')';

  var percentRegex = new RegExp( decimalRegexPrefix + '%$' );

  // Amgles.
  var degreesRegex  = new RegExp( decimalRegexPrefix + 'deg$' );
  var radiansRegex  = new RegExp( decimalRegexPrefix + 'rad$' );
  var gradiansRegex = new RegExp( decimalRegexPrefix + 'grad$' );
  var turnsRegex    = new RegExp( decimalRegexPrefix + 'turn$' );

  var PI2 = 2 * Math.PI;

  var DEG_TO_RAD  = PI2 / 360;
  var GRAD_TO_RAD = PI2 / 400;
  var TURN_TO_RAD = PI2 / 4;

  /**
   * Convert a numeric string value to a pixel dimension. If value is a
   * percentage, convert to pixels relative to length.
   */
  function position( value, length ) {
    if ( typeof value === 'number' ) {
      return value;
    }

    if ( percentRegex.test( value ) ) {
      return parseFloat( value ) / 100 * length;
    }

    return parseFloat( value );
  }

  /**
   * Converts a CSS angle measurement (degrees, radians, gradians, turns) to
   * radians.
   */
  function radians( value ) {
    if ( typeof value === 'number' ) {
      return value;
    }

    if ( degreesRegex.test( value ) ) {
      return parseFloat( value ) * DEG_TO_RAD;
    } else if ( radiansRegex.test( value ) ) {
      // Exit early for radians.
      return parseFloat( value );
    } else if ( gradiansRegex.test( value ) ) {
      return parseFloat( value ) * GRAD_TO_RAD;
    } else if ( turnsRegex.test( value ) ) {
      return parseFloat( value ) * TURN_TO_RAD;
    }

    return parseFloat( value );
  }

  /**
   * Returns angle from (x0, y0) to (x1, y1) in the range [0, PI2).
   */
  function angleTo( x0, y0, x1, y1 ) {
    var angle = Math.atan2( y1 - y0, x1 - x0 );

    if ( angle < 0 ) {
      angle += PI2;
    }

    return angle;
  }

  return function( el, options ) {
    if ( !el ) {
      return;
    }

    options = options || {};
    var rect = el.getBoundingClientRect();

    var width  = options.width  || rect.width;
    var height = options.height || rect.height;

    var x = position( options.x, width  ) || 0;
    var y = position( options.y, height ) || 0;

    var canvas = document.createElement( 'canvas' );
    var ctx    = canvas.getContext( '2d' );

    canvas.width  = width;
    canvas.height = height;

    var imageData = ctx.getImageData( 0, 0, width, height );
    var data = imageData.data;

    var t;
    var i, j;
    var index;
    for ( i = 0; i < height; i++ ) {
      for ( j = 0; j < width; j++ ) {
        index = 4 * ( i * width + j );

        // Angle parameter.
        t = angleTo( x, y, j, i ) / PI2;

        data[ index     ] = Math.round( lerp( 0, 255, t ) );
        data[ index + 1 ] = Math.round( lerp( 0, 255, t ) );
        data[ index + 2 ] = Math.round( lerp( 0, 255, t ) );
        data[ index + 3 ] = 255;
      }
    }

    ctx.putImageData( imageData, 0, 0 );

    el.style.background = 'url(' + canvas.toDataURL( 'image/jpeg' ) + ')';
  };
}) ();
