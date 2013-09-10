/*globals jQuery*/
(function( $, window, document, undefined ) {
  'use strict';

  var $eyeballLeft  = $( '#eyeball-left' ),
      $eyeballRight = $( '#eyeball-right' ),
      $pupilLeft    = $( '#pupil-left' ),
      $pupilRight   = $( '#pupil-right' );

  var eyeballLeftRadius,
      eyeballRightRadius,
      pupilLeftRadius,
      pupilRightRadius;

  var positionLeft,
      positionRight;

  var mouse = {
    x: 0,
    y: 0
  };

  function resize() {
    eyeballLeftRadius  = 0.5 * $eyeballLeft.width();
    eyeballRightRadius = 0.5 * $eyeballRight.width();
    pupilLeftRadius    = 0.5 * $pupilLeft.width();
    pupilRightRadius   = 0.5 * $pupilRight.width();

    positionLeft  = parseInt( $eyeballLeft.css( 'left' ), 10 );
    positionRight = parseInt( $eyeballRight.css( 'left' ), 10 );
  }

  function update( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    $pupilLeft.css({
      left: mouse.x + 'px',
      top:  mouse.y + 'px'
    });

    $pupilRight.css({
      left: mouse.x + 'px',
      top:  mouse.y + 'px'
    });

    var halfHeight = 0.5 * window.innerHeight;

    var dxLeft  = mouse.x - positionLeft,
        dxRight = mouse.x - positionRight,
        dy  = mouse.y - halfHeight;

    var distanceLeft = Math.sqrt( dxLeft * dxLeft + dy * dy );
    var angle;
    if ( distanceLeft > eyeballLeftRadius - pupilLeftRadius ) {
      angle = Math.atan2( dy, dxLeft );
      $pupilLeft.css({
        left: positionLeft + ( eyeballLeftRadius - pupilLeftRadius ) * Math.cos( angle ) + 'px',
        top:  halfHeight   + ( eyeballLeftRadius - pupilLeftRadius ) * Math.sin( angle ) + 'px'
      });
    }

    var distanceRight = Math.sqrt( dxRight * dxRight + dy * dy );
    if ( distanceRight > eyeballRightRadius - pupilRightRadius ) {
      angle = Math.atan2( dy, dxRight );
      $pupilRight.css({
        left: positionRight + ( eyeballRightRadius - pupilRightRadius ) * Math.cos( angle ) + 'px',
        top:  halfHeight    + ( eyeballRightRadius - pupilRightRadius ) * Math.sin( angle ) + 'px'
      });
    }
  }

  resize();

  $( window ).on( 'resize', resize );
  $( document ).on( 'mousemove', update );
}) ( jQuery, window, document );
