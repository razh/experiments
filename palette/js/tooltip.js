/*exported Tooltip*/
var Tooltip = (function( document ) {
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
  }) ();

  function Tooltip() {
    this.el = document.createElement( 'div' );
    this.el.classList.add( 'tooltip' );
    this.parentEl = null;

    this.width = 0;
    this.height = 0;
  }

  Tooltip.create = function( el ) {
    if ( !el ) {
      return;
    }

    var tooltip = new Tooltip();
    tooltip.setElement( el );
    tooltip.setContent( tooltip.direction );

    var rect = el.getBoundingClientRect();

    tooltip.setPosition( rect.left, rect.top );

    document.body.appendChild( tooltip.el );

    return tooltip;
  };

  Tooltip.prototype.setElement = function( el ) {
    if ( !el ) {
      return;
    }

    this.parentEl = el;
    this.direction = el.getAttribute( 'data-direction' );
  };

  Tooltip.prototype.setContent = function( content ) {
    this.el.textContent = content || '';

    var rect = this.el.getBoundingClientRect();

    this.el.style.marginLeft = -0.5 * rect.width;
    this.el.style.marginTop = -0.5 * rect.height;
  };

  Tooltip.prototype.setPosition = function( x, y ) {
    var parentRect = this.parentEl.getBoundingClientRect();

    var width = parentRect.width;
    var height = parentRect.height;

    if ( this.direction === 'left' ) {
      x -= width;
    }

    if ( this.direction === 'right' ) {
      x += width;
    }

    if ( this.direction === 'top' || this.direction === 'bottom' ) {
      x += 0.5 * width;
    }

    if ( this.direction === 'left' || this.direction === 'right' ) {
      y += 0.5 * height;
    }

    if ( this.direction === 'top' ) {
      y -= height;
    }

    if ( this.direction === 'bottom' ) {
      y += height;
    }

    this.el.style.left = Math.round( x || 0 ) + 'px';
    this.el.style.top = Math.round( y || 0 ) + 'px';
  };

  return Tooltip;
}) ( document );
