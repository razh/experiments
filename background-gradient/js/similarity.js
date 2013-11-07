/*globals DEG_TO_RAD, closestPointOnUnitLine,
Background, LinearGradient, ColorStop, RGBAColor*/
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

    // Incorrect determination of the gradient line.
    var dx = Math.sin( angle ) * halfWidth,
        dy = Math.cos( angle ) * halfHeight;

    var x0 = halfWidth + dx,
        y0 = halfHeight + dy,
        x1 = halfWidth - dx,
        y1 = halfHeight - dy;

    var gradient = ctx.createLinearGradient( x0, y0, x1, y1 );

    // Draw debug.
    ctx.beginPath();
    ctx.moveTo( x0, y0 );
    ctx.lineTo( x1, y1 );

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'red';
    ctx.stroke();

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

      // Draw the gradient line.
      gradient.canvas( ctx, totalAlpha );
    });
  };


  /**
   * Utility method to quickly create a Background from an array of gradient
   * data, where each gradient object has an angle and a bunch of colorstops.
   */
  function createBackground( data ) {
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

    return background;
  }

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

    var background = createBackground( data );

    gradientCSS.style.backgroundImage = background.css();
    background.canvas( gradientCtx );
  }) ();


  // Test gradient line determination for canvas.
  (function() {
    var el = document.querySelector( '.angle' );

    var gradientCSS = el.querySelector( '.gradient-css' );

    var gradientCanvas = el.querySelector( '.gradient-canvas' ),
        gradientCtx    = gradientCanvas.getContext( '2d' );

    gradientCanvas.width  = 640;
    gradientCanvas.height = 480;

    var data = [{
      angle: '30deg',
      colorStops: [
        [ 128, 128, 128, 1.0 ],
        [ 240, 128, 128, 1.0 ],
        [ 0, 0, 128, 1.0 ],
        [ 0, 128, 128, 1.0 ],
        [ 255, 255, 128, 1.0 ]
      ]
    }];

    var background = createBackground( data );

    gradientCSS.style.backgroundImage = background.css();
    background.canvas( gradientCtx );
  }) ();

  // Test diff.
}) ( window, document );
