/*globals $, LinearGradient, ColorStop, RGBColor, RAD_TO_DEG*/
$(function() {
  'use strict';

  var $gradient = $( '#gradient-canvas' );

  var $gradientOffset = $gradient.offset();

  var x = $gradientOffset.left + 0.5 * $gradient.width(),
      y = $gradientOffset.top  + 0.5 * $gradient.height();

  var angle = 0;

  var gradient = new LinearGradient();
  gradient.colorStops.push( new ColorStop( new RGBColor( 255,   0, 128 ) ) );
  gradient.colorStops.push( new ColorStop( new RGBColor(   0, 255, 255 ), '30%' ) );
  gradient.colorStops.push( new ColorStop( new RGBColor(   0,   0, 255 ) ) );

  $gradient.css( 'background', gradient.css() );

  function update() {
    // Clean-up.
    $gradient.children( '.colorstop' ).remove();

    var colorStopCount = gradient.colorStops.length - 1;
    gradient.colorStops.forEach(function( colorStop, index ) {
      var $colorStop = $( '<div class="colorstop" id="colorstop-' + index + '"></div>' );

      $colorStop.css({
        background: colorStop.css(),
        top:  ( index / colorStopCount ) * 100 + '%',
        left: ( index / colorStopCount ) * 100 + '%',
        transform: 'rotateZ(' + gradient.angle + ')'
      });

      $gradient.append( $colorStop );
    });
  }

  update();

  function onMouseMove( event ) {
    var dx = event.pageX - x,
        dy = event.pageY - y;

    angle = ( Math.atan2( dy, dx ) * RAD_TO_DEG ).toFixed(0);
    gradient.angle = angle + 'deg';
    $gradient.css( 'background', gradient.css() );

    update();
  }

  $( window ).on({
    mousemove: onMouseMove
  });

  var $canvas = $( '#canvas' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );
});
