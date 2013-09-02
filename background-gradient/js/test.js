/*globals $, requestAnimationFrame*/
$(function() {
  'use strict';

  var $canvas = $( '#canvas' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );

  var $background = $( '.gradient-view' );

  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
  }

  function limit( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  function RGBAColor( red, green, blue, alpha ) {
    this.red   = red   || 0;
    this.green = green || 0;
    this.blue  = blue  || 0;
    this.alpha = alpha || 0.0;
  }

  RGBAColor.prototype.css = function( totalAlpha ) {
    return 'rgba(' +
      Math.round( limit( this.red,   0, 255 ) ) + ', ' +
      Math.round( limit( this.green, 0, 255 ) ) + ', ' +
      Math.round( limit( this.blue,  0, 255 ) ) + ', ' +
      round( this.alpha / totalAlpha, 2 ) +
    ')';
  };

  function HSLAColor( hue, saturation, lightness, alpha ) {
    this.hue        = hue        || 0;
    this.saturation = saturation || 0.0;
    this.lightness  = lightness  || 0.0;
    this.alpha      = alpha      || 0.0;
  }

  HSLAColor.prototype.css = function( totalAlpha ) {
    return 'hsla(' +
      Math.round( limit( this.hue, 0, 360 ) ) + ', ' +
      this.saturation.toFixed(0) + '%, ' +
      this.lightness.toFixed(0)  + '%, ' +
      round( this.alpha / totalAlpha, 2 ) +
    ')';
  };

  function ColorStop( color, position ) {
    this.color    = color || new RGBAColor();
    this.position = position || null;
  }

  ColorStop.prototype.css = function( totalAlpha ) {
    return this.color.css( totalAlpha ) + ( this.position ? ' ' + this.position : '' );
  };

  function LinearGradient() {
    this.angle = '';
    this.colorStops = [];
  }

  LinearGradient.prototype.css = function( totalAlpha ) {
    return 'linear-gradient(' +
      ( this.angle.length ? this.angle + ', ' : '' ) +
      this.colorStops.map(function( colorStop ) {
        return colorStop.css( totalAlpha );
      }).join( ', ' ) + ')';
  };

  var testGradient = new LinearGradient();
  testGradient.angle = '45deg';
  testGradient.colorStops.push( new RGBAColor( 255, 0, 0, 1.0 ) );
  testGradient.colorStops.push( new RGBAColor( 255, 255, 128, 1.0 ) );

  var testGradient2 = new LinearGradient();
  testGradient2.colorStops.push( new RGBAColor( 128, 128, 128, 1.0 ) );
  testGradient2.colorStops.push( new RGBAColor( 0, 0, 127, 1.0 ) );

  function Background() {
    this.gradients = [];
  }

  Background.prototype.css = function() {
    var totalAlpha = this.gradients.length;
    return this.gradients.map(function( gradient ) {
      return gradient.css( totalAlpha );
    }).join( ', ' );
  };

  var testBackground = new Background();
  testBackground.gradients.push( testGradient );
  testBackground.gradients.push( testGradient2 );

  console.log( testBackground.css() );

  $background.css({
    background: testBackground.css()
  });

  var gradients = [];

  function tick() {
    draw( context );
  }

  function draw( ctx ) {
  }

});
