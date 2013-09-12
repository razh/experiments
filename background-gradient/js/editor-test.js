/*globals $, PI2, LinearGradient, ColorStop, RGBColor, RAD_TO_DEG, DEG_TO_RAD*/
$(function() {
  'use strict';

  var HALF_PI = 0.5 * Math.PI;

  var $gradient = $( '#gradient-canvas' );

  var $canvas = $( '#canvas' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );

  canvas.width = $canvas.parent().width();
  canvas.height = $canvas.parent().height();

  var $gradientOffset = $gradient.offset();

  var x = $gradientOffset.left + 0.5 * $gradient.width(),
      y = $gradientOffset.top  + 0.5 * $gradient.height();

  var gradientAngle = 0;

  var gradient = new LinearGradient();
  gradient.angle = gradientAngle + 'deg';
  gradient.colorStops.push( new ColorStop( new RGBColor( 255,   0, 128 ) ) );
  gradient.colorStops.push( new ColorStop( new RGBColor(   0, 255, 255 ), '40%' ) );
  gradient.colorStops.push( new ColorStop( new RGBColor( 255, 128, 255 ), '80%' ) );
  gradient.colorStops.push( new ColorStop( new RGBColor(   0,   0, 255 ) ) );

  $gradient.css( 'background', gradient.css() );

  function normalizeAngle( angle ) {
    angle = angle % PI2;
    return angle >= 0 ? angle : angle + PI2;
  }

  function quadrantOf( angle ) {
    if ( angle < HALF_PI) { return 0; }
    if ( angle < Math.PI ) { return 1; }
    if ( angle < Math.PI + HALF_PI ) { return 2; }
    return 3;
  }

  function update() {
    // Clean-up.
    $gradient.children( '.colorstop' ).remove();

    var quadrant = quadrantOf( gradientAngle * DEG_TO_RAD );

    var colorStopCount = gradient.colorStops.length - 1;
    gradient.colorStops.forEach(function( colorStop, index ) {
      var $colorStop = $( '<div class="colorstop" id="colorstop-' + index + '"></div>' );

      var top, left;
      // TODO: Clean this stuff up!
      // This only handles percentages right now.
      if ( quadrant === 0 || quadrant === 1 ) {
        left = ( index / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          left = colorStop.position;
        }
      }

      if ( quadrant === 1 || quadrant === 2 ) {
        top  = ( index / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          top = colorStop.position;
        }
      }

      if ( quadrant === 0 || quadrant === 3 ) {
        top  = ( ( colorStopCount - index ) / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          top = ( 100 - parseInt( colorStop.position, 10 ) ) + '%';
        }
      }

      if ( quadrant === 2 || quadrant === 3 ) {
        left = ( ( colorStopCount - index ) / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          left = ( 100 - parseInt( colorStop.position, 10 ) ) + '%';
        }
      }

      if ( gradient.angle === '0deg' || gradient.angle === '180deg' ) {
        left = '50%';
      }

      if ( gradient.angle === '90deg' || gradient.angle === '270deg' ) {
        top = '50%';
      }

      $colorStop.css({
        background: colorStop.css(),
        top:  top,
        left: left,
        transform: 'rotateZ(' + gradient.angle + ')'
      });

      $gradient.append( $colorStop );
    });

    updateCanvas( context );
  }

  function updateCanvas( ctx ) {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.font = '16pt Helvetica, Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText( gradientAngle, 20, canvas.height - 20 );
  }

  update();

  function onMouseMove( event ) {
    var dx = event.pageX - x,
        dy = event.pageY - y;

    gradientAngle = ( normalizeAngle( Math.atan2( dy, dx ) ) * RAD_TO_DEG ).toFixed(0);
    gradient.angle = gradientAngle + 'deg';
    $gradient.css( 'background', gradient.css() );

    update();
  }

  $( window ).on({
    mousemove: onMouseMove
  });
});
