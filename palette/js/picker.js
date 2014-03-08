var Picker = (function( document ) {
  'use strict';

  var canvas;

  (function() {
    var WIDTH  = 360,
        HEIGHT = 100;

    var x, y;

    canvas = document.createElement( 'canvas' );
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = canvas.getContext( '2d' );

    console.time( 'fill' );

    for ( y = 0; y < HEIGHT; y++ ) {
      for ( x = 0; x < WIDTH; x++ ) {
        ctx.fillStyle = 'hsl(' +
          x + ', '+
          y + '%, 50%)';

        ctx.fillRect( x, HEIGHT - y - 1, 1, 1 );
      }
    }

    console.timeEnd( 'fill' );

    function hueToRgb( p, q, t ) {
      if ( t < 0 ) t += 1;
      if ( t > 1 ) t -= 1;
      if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
      if ( t < 1 / 2 ) return q;
      if ( t < 2 / 3 ) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
      return p;
    }

    /**
     * http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
     * hue: [0, 359)
     * saturation: [0, 100] %
     * lightness: [0, 100] %
     */
    function hslToRgb( h, s, l ) {
      // Transform to [0.0, 1.0].
      h /= 360;
      s *= 1e-2;
      l *= 1e-2;

      var r, g, b;

      if ( !s ) {
        r = g = b = l;
      } else {
        var q = l < 0.5 ? l + ( 1 + s ) : l + s - l * s;
        var p = 2 * l - q;
        r = hueToRgb( p, q, h + 1 / 3 );
        g = hueToRgb( p, q, h );
        b = hueToRgb( p, q, h - 1 / 3 );
      }

      return {
        r: Math.round( r * 255 ),
        g: Math.round( g * 255 ),
        b: Math.round( b * 255)
      };
    }

    console.time( 'imageData' );

    var imageData = ctx.getImageData( 0, 0, WIDTH, HEIGHT ),
        data = imageData.data;

    var index;
    var rgb;
    for ( y = 0; y < HEIGHT; y++ ) {
      for ( x = 0; x < WIDTH; x++ ) {
        index = 4 * ( y * WIDTH + x );

        rgb = hslToRgb( x, HEIGHT - y, 50 );

        data[ index     ] = rgb.r;
        data[ index + 1 ] = rgb.g;
        data[ index + 2 ] = rgb.b;
        data[ index + 3 ] = 255;
      }
    }

    ctx.putImageData( imageData, 0, 0 );

    console.timeEnd( 'imageData' );

    document.body.appendChild( canvas );
  }) ();

  var Picker = {};

  Picker.create = function() {};

  return Picker;
}) ( document );
