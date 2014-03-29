/*exported angleGradient*/
var angleGradient = (function() {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  var rgbRegex = new RegExp(
    '^' +
    'rgb\\(' +
      '(\\d+),\\s*' +
      '(\\d+),\\s*' +
      '(\\d+)' +
    '\\)' +
    '$'
  );

  var rgbaRegex = new RegExp(
    '^' +
    'rgba\\(' +
      '(\\d+),\\s*' +
      '(\\d+),\\s*' +
      '(\\d+),\\s*' +
      '(\\d+(?:\\.\\d+)?)' +
    '\\)' +
    '$'
  );

  function toInt( string ) {
    return parseInt( string, 10 );
  }

  /**
   * Extracts an array of rgba values from a RGB or RGBA color string.
   * All values are in the range [0, 255].
   */
  function parseColor( colorString ) {
    var rgb = rgbRegex.exec( colorString );
    if ( rgb ) {
      rgb = rgb.slice( 1, 4 ).map( toInt );
      rgb[3] = 255;
      return rgb;
    }

    var rgba = rgbaRegex.exec( colorString );
    // Not a valid rgb(a) color. Return transparent black.
    if ( !rgba ) {
      return [ 0, 0, 0, 0 ];
    }

    rgba = rgba.slice( 1, 5 );
    rgba[3] *= 255;
    return rgba.map( toInt );
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

  function colorAtAngleFn( colorStops ) {
    if ( colorStops.length < 2 ) {
      return;
    }

    colorStops = colorStops.map(function( colorStop, index ) {
      return {
        angle: radians( colorStop.angle ),
        color: parseColor( colorStop.color ),
        index: index
      };
    });

    // Hacky stable sorting of angles.
    colorStops.sort(function( a, b ) {
      if ( isNaN( a.angle ) ||
           isNaN( b.angle ) ||
           a.angle === b.angle ) {
        return a.index - b.index;
      }

      return a.angle - b.angle;
    });


    // Add in undefined angles.
    (function() {
      // Handle undefined first and last angles.
      if ( isNaN( colorStops[0].angle ) ) {
        colorStops[0].angle = 0;
      }

      var lastIndex = colorStops.length - 1;
      if ( isNaN( colorStops[ lastIndex ] ) ) {
        colorStops[ lastIndex ].angle = PI2;
      }

      var startIndex = 0;
      var endIndex;
      var start, end;

      var i, j;
      var il;
      var t;

      // Find next valid angle.
      for ( i = 1, il = colorStops.length; i < il; i++ ) {
        // Find next invalid angle or last element.
        if ( !isNaN( colorStops[i].angle ) || i === il - 1 ) {
          endIndex = i;

          start = colorStops[ startIndex ].angle;
          end = colorStops[ endIndex ].angle;

          // Fill in.
          for ( j = startIndex + 1; j < endIndex; j++ ) {
            t = ( j - startIndex ) / ( endIndex - startIndex );
            colorStops[j].angle = lerp( start, end, t );
          }

          // Jump.
          i = startIndex = endIndex;
        }
      }
    }) ();

    // Add 0 and PI2 endpoints (copies of existing endpoints) if missing.
    if ( colorStops[0].angle > 0 ) {
      colorStops.unshift({
        angle: 0,
        color: colorStops[0].color.slice()
      });
    }

    var lastIndex = colorStops.length - 1;
    if ( colorStops[ lastIndex ].angle < PI2 ) {
      colorStops.push({
        angle: PI2,
        color: colorStops[ lastIndex ].color.slice()
      });
    }

    return function( angle ) {
      // Determine start and end colorStops.
      var i, il;
      for ( i = 0, il = colorStops.length; i < il - 1; i++ ) {
        if ( angle < colorStops[ i + 1 ].angle ) {
          break;
        }
      }

      var start = colorStops[i];
      var end = colorStops[ i + 1 ];

      // Angle parameter.
      var t = ( angle - start.angle ) / ( end.angle - start.angle );

      return [
        lerp( start.color[0], end.color[0], t ),
        lerp( start.color[1], end.color[1], t ),
        lerp( start.color[2], end.color[2], t ),
        lerp( start.color[3], end.color[3], t )
      ];
    };
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

    var colorStops = options.colorStops || [];
    var colorAtAngle = colorAtAngleFn( colorStops );
    if ( !colorAtAngle ) {
      return;
    }

    var canvas = document.createElement( 'canvas' );
    var ctx    = canvas.getContext( '2d' );

    canvas.width  = width;
    canvas.height = height;

    var imageData = ctx.getImageData( 0, 0, width, height );
    var data = imageData.data;

    console.time( 'gradient' );

    var color;
    var i, j;
    var index;
    for ( i = 0; i < height; i++ ) {
      for ( j = 0; j < width; j++ ) {
        index = 4 * ( i * width + j );

        color = colorAtAngle( angleTo( x, y, j, i ) );

        data[ index     ] = color[0];
        data[ index + 1 ] = color[1];
        data[ index + 2 ] = color[2];
        data[ index + 3 ] = color[3];
      }
    }
    console.timeEnd( 'gradient' );

    ctx.putImageData( imageData, 0, 0 );

    el.style.background = 'url(' + canvas.toDataURL( 'image/jpeg' ) + ')';
  };
}) ();