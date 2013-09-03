/*globals $, requestAnimationFrame*/
$(function() {
  'use strict';

  var $canvas = $( '#canvas' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );

  var $background = $( '.gradient-view' );


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

  function randomGradient() {
    var grad = new LinearGradient();
  }

  // draw( context );
});
