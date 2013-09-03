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

  var testGradient = new LinearGradient();
  testGradient.angle = '45deg';
  testGradient.colorStops.push( new ColorStop( new RGBAColor( 255, 0, 0, 1.0 ) ) );
  testGradient.colorStops.push( new ColorStop( new RGBAColor( 255, 255, 128, 1.0 ) ) );

  var testGradient2 = new LinearGradient();
  testGradient2.colorStops.push( new ColorStop( new RGBAColor( 240, 128, 128, 1.0 ), '10%' ) );
  testGradient2.colorStops.push( new ColorStop( new RGBAColor( 127, 0, 127, 1.0 ) ) );

  var testGradient3 = new LinearGradient();
  testGradient3.angle = 'to top left';
  testGradient3.colorStops.push( new ColorStop( new RGBAColor( 128, 128, 128, 1.0 ) ) );
  testGradient3.colorStops.push( new ColorStop( new RGBAColor( 240, 128, 127, 1.0 ) ) );

  var testRadGradient = new RadialGradient();
  testRadGradient.shape = 'ellipse';
  testRadGradient.colorStops.push( new ColorStop( new HSLAColor( 0, 0, 0, 1.0 ) ) );
  testRadGradient.colorStops.push( new ColorStop( new RGBAColor( 255, 255, 255, 1.0 ) ) );

  console.log(testRadGradient.css());

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

  var testBackground = new Background();
  testBackground.gradients.push( testGradient );
  testBackground.gradients.push( testGradient2 );
  testBackground.gradients.push( testGradient3 );

  var css = testBackground.css();
  console.log( css );

  $background.css({
    background: css
  });

  var gradients = [];

  function tick() {
    draw( context );
  }

  function draw( ctx ) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var patternCanvas = document.createElement( 'canvas' );
    patternCanvas.width = 64;
    patternCanvas.height = 64;

    var patternCtx = patternCanvas.getContext( '2d' );
    patternCtx.moveTo( 0, 0 );
    patternCtx.lineTo( patternCanvas.width, patternCanvas.height );
    patternCtx.moveTo( patternCanvas.width, 0 );
    patternCtx.lineTo( 0, patternCanvas.height );

    patternCtx.lineWidth = 1;
    patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    patternCtx.stroke();

    ctx.fillStyle = ctx.createPattern( patternCanvas, 'repeat' );
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
  }

  // draw( context );
});
