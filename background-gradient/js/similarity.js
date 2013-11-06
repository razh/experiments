/*globals LinearGradient, ColorStop, RGBAColor*/
(function( window, document, undefined ) {
  'use strict';

  /**
   * Returns the canvas version of a linear gradient.
   */
  LinearGradient.prototype.canvas = function( ctx, x, y, width, height ) {

    var gradient = ctx.createLinearGradient( x, y, width, height );

    this.colorStops.forEach(function( colorStop ) {
      console.log( colorStop.css() );
    });

    return gradient;
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

    var grad = new LinearGradient();

    console.log( grad );

    grad.colorStops = grad.colorStops.concat([
      new ColorStop( new RGBAColor( 255, 255, 255, 1.0 ) ),
      new ColorStop( new RGBAColor( 255, 255, 255, 1.0 ) )
    ]);

    grad.angle = '45deg';

    console.log( grad.css() );
  }) ();

  // Test diff.
}) ( window, document );
