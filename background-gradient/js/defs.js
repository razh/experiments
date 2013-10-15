'use strict';

var RAD_TO_DEG = 180 / Math.PI,
    DEG_TO_RAD = Math.PI / 180;

var PI2 = 2 * Math.PI;

function round( value, precision ) {
  return parseFloat( value.toFixed( precision ) );
}

function limit( value, min, max ) {
  return Math.min( Math.max( value, min ), max );
}

function randomInt( min, max ) {
  return Math.round( min + Math.random() * ( max - min ) );
}

function RGBAColor( red, green, blue, alpha ) {
  this.red   = red   || 0;
  this.green = green || 0;
  this.blue  = blue  || 0;
  this.alpha = alpha || 0.0;
}

RGBAColor.prototype.css = function( totalAlpha ) {
  if ( typeof totalAlpha === 'undefined' ) {
    totalAlpha = 1;
  }

  return 'rgba(' +
    Math.round( limit( this.red,   0, 255 ) ) + ', ' +
    Math.round( limit( this.green, 0, 255 ) ) + ', ' +
    Math.round( limit( this.blue,  0, 255 ) ) + ', ' +
    round( this.alpha / totalAlpha, 2 ) +
  ')';
};

function RGBColor( red, green, blue ) {
  RGBAColor.call( this, red, green, blue, 1 );
}

RGBColor.prototype = new RGBAColor();
RGBColor.prototype.constructor = RGBColor;

function HSLAColor( hue, saturation, lightness, alpha ) {
  this.hue        = hue        || 0;
  this.saturation = saturation || 0.0;
  this.lightness  = lightness  || 0.0;
  this.alpha      = alpha      || 0.0;
}

HSLAColor.prototype.css = function( totalAlpha ) {
  if ( typeof totalAlpha === 'undefined' ) {
    totalAlpha = 1;
  }

  return 'hsla(' +
    Math.round( limit( this.hue, 0, 360 ) ) + ', ' +
    Math.round( this.saturation ) + '%, ' +
    Math.round( this.lightness  ) + '%, ' +
    round( this.alpha / totalAlpha, 2 ) +
  ')';
};

function HSLColor( hue, saturation, lightness ) {
  HSLAColor.call( this, hue, saturation, lightness );
}

HSLColor.prototype = new HSLAColor();
HSLColor.prototype.constructor = HSLColor;

function ColorStop( color, position ) {
  this.color    = color || new RGBAColor();
  this.position = position || null;
}

ColorStop.prototype.css = function( totalAlpha ) {
  return this.color.css( totalAlpha ) + ( this.position ? ' ' + this.position : '' );
};

/**
 * Gradient.
 */
function Gradient() {
  this.colorStops = [];
}

Gradient.prototype.maxAlpha = function() {
  return Math.max.apply( this, this.colorStops.map(function( colorStop ) {
    return colorStop.color.alpha;
  }));
};

Gradient.prototype.colorStopsString = function( totalAlpha ) {
  return this.colorStops.map(function( colorStop ) {
    return colorStop.css( totalAlpha );
  }).join( ', ' );
};

/**
 * LinearGradient.
 */
function LinearGradient() {
  Gradient.call( this );
  this.angle = '';
}

LinearGradient.prototype = new Gradient();
LinearGradient.prototype.constructor = LinearGradient;

LinearGradient.prototype.css = function( totalAlpha ) {
  return 'linear-gradient(' +
    ( this.angle ? this.angle + ', ' : '' ) +
    this.colorStopsString( totalAlpha ) +
  ')';
};

/**
 * RadialGradient.
 */
function RadialGradient() {
  Gradient.call( this );
  this.position = '';
  this.angle = '';
  this.shape = '';
  this.size = '';
}

RadialGradient.prototype = new Gradient();
RadialGradient.prototype.constructor = RadialGradient;

RadialGradient.prototype.css = function( totalAlpha ) {
  return 'radial-gradient(' +
    ( this.position ? this.position + ', ' : '' ) +
    ( this.shape ? this.shape + ', ' : '' ) +
    this.colorStopsString( totalAlpha ) +
  ')';
};

/**
 * Background.
 */
function Background() {
  this.gradients = [];
}

Background.prototype.css = function() {
  var totalAlpha = this.gradients.reduce(function( previousValue, gradient ) {
    return previousValue + gradient.maxAlpha();
  }, 0 );

  return this.gradients.map(function( gradient ) {
    return gradient.css( totalAlpha );
  }).join( ', ' );
};


