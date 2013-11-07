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

    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    var angle = -parseInt( this.angle, 10 ) * DEG_TO_RAD;

    if ( isNaN( angle ) ) {
      angle = Math.PI;
    }

    var dx = Math.sin( angle ) * halfWidth,
        dy = Math.cos( angle ) * halfHeight;

    var gradient = ctx.createLinearGradient(
      halfWidth + dx, halfHeight + dy,
      halfWidth - dx, halfHeight - dy
    );

    var lastIndex = this.colorStops.length - 1;
    this.colorStops.forEach(function( colorStop, index ) {
      gradient.addColorStop( index / lastIndex, colorStop.color.css( totalAlpha ) );
    });

    return gradient;
  };

  Background.prototype.canvas = function( ctx ) {
    var totalAlpha = this.totalAlpha();

    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var gradientsReverse = this.gradients.slice().reverse();

    gradientsReverse.forEach(function( gradient ) {
      ctx.fillStyle = gradient.canvas( ctx, totalAlpha );
      ctx.fillRect( 0, 0, width, height );
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

  // Test converting to CSS and canvas linear gradients.
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
