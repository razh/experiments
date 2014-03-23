/*exported angleGradient*/
var angleGradient = (function() {
  'use strict';

  var decimalRegexPrefix = '^((-)?\\d+(\\.\\d+)?)';

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
  function angle( value ) {
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

  return function( el, options ) {
    var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : {};

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
  };
}) ();
