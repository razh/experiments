/*exported angleGradient*/
var angleGradient = (function() {
  'use strict';

  // Test for percentages with decimal places.
  var percentRegex = /^(\d+(\.\d+)?)%$/;

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
