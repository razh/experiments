/*globals DEG_TO_RAD, Background, LinearGradient, ColorStop, RGBAColor*/
(function( window, document, undefined ) {
  'use strict';

  /**
   * Returns the canvas version of a linear gradient.
   * Does not handle custom positions.
   */
  LinearGradient.prototype.canvas = function( ctx, totalAlpha ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var angle = parseInt( this.angle, 10 ) * DEG_TO_RAD || 0;

    var dx = Math.abs( Math.round( Math.sin( angle ) * width ) ),
        dy = Math.abs( Math.round( Math.cos( angle ) * height ) );

    console.log( dx, dy, width, height );

    var gradient = ctx.createLinearGradient( 0, 0, dx, dy );

    this.colorStops.forEach(function( colorStop, index ) {
      console.log(colorStop.color.css( totalAlpha))
      gradient.addColorStop( index, colorStop.color.css( totalAlpha ) );
    });

    return gradient;
  };

  Background.prototype.canvas = function( ctx ) {
    var totalAlpha = this.totalAlpha();

    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    this.gradients.forEach(function( gradient ) {
      ctx.save();

      // Rotate around center.
      ctx.translate( -halfWidth, -halfHeight );
      ctx.rotate( -parseInt( gradient.angle, 10 ) * DEG_TO_RAD );
      ctx.translate( halfWidth, halfHeight );

      ctx.fillStyle = gradient.canvas( ctx, totalAlpha );
      ctx.fillRect( 0, 0, width, height );

      ctx.restore();
    });
  };

  // Syntax explorations.
  (function() {
    var el = document.querySelector( '.syntax' );

    var gradientCanvas = el.querySelector( '.gradient-canvas' ),
        gradientCtx    = gradientCanvas.getContext( '2d' );

    var WIDTH  = 640,
        HEIGHT = 480;

    gradientCanvas.width  = WIDTH;
    gradientCanvas.height = HEIGHT;

    var grad = gradientCtx.createLinearGradient( 0, 0, 0, HEIGHT );
    grad.addColorStop( 0, 'black' );
    grad.addColorStop( 1, 'white' );

    gradientCtx.fillStyle = grad;
    gradientCtx.fillRect( 0, 0, WIDTH, HEIGHT );
  }) ();

  // Test converting between CSS and canvas linear gradients.
  (function() {
    var el = document.querySelector( '.conversion' );

    var gradientCSS = el.querySelector( '.gradient-css' );

    var gradientCanvas = el.querySelector( '.gradient-canvas' ),
        gradientCtx    = gradientCanvas.getContext( '2d' );

    gradientCanvas.width  = 640;
    gradientCanvas.height = 480;

    // Test data.
    var data = [
      {
        angle: '45deg',
        colorStops: [
          [ 255, 0, 0, 1.0 ],
          [ 255, 255, 128, 1.0 ]
        ]
      },
      {
        angle: '',
        colorStops: [
          [ 240, 128, 128, 1.0 ],
          [ 127, 0, 127, 1.0 ]
        ]
      },
      {
        angle: '215deg',
        colorStops: [
          [ 128, 128, 128, 1.0 ],
          [ 240, 128, 128, 1.0 ]
        ]
      }
    ];

    data = [{
      angle: '',
      colorStops: [
        [ 240, 128, 128, 1.0 ],
        [ 127, 0, 127, 1.0 ]
      ]
    }];

    data = [{
      angle: '180deg',
      colorStops: [
        [ 0, 0, 0, 1.0 ],
        [ 240, 128, 128, 1.0 ]
      ]
    }];

    var background = new Background();

    data.forEach(function( gradientData ) {
      var gradient = new LinearGradient();

      gradient.angle = gradientData.angle;
      gradientData.colorStops.forEach(function( colorStop ) {
        gradient.colorStops.push(
          new ColorStop(
            new RGBAColor( colorStop[0], colorStop[1], colorStop[2], colorStop[3] )
          )
        );
      });

      background.gradients.push( gradient );
    });

    gradientCSS.style.backgroundImage = background.css();
    background.canvas( gradientCtx );
  }) ();

  // Test diff.
}) ( window, document );
