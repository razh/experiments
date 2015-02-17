(function( window, document, undefined ) {
  'use strict';

  var eyeballLeft  = document.querySelector( '#eyeball-left' ),
      eyeballRight = document.querySelector( '#eyeball-right' ),
      pupilLeft    = document.querySelector( '#pupil-left' ),
      pupilRight   = document.querySelector( '#pupil-right' );

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
    eyeballLeftRadius  = 0.5 * eyeballLeft.offsetWidth;
    eyeballRightRadius = 0.5 * eyeballRight.offsetWidth;
    pupilLeftRadius    = 0.5 * pupilLeft.offsetWidth;
    pupilRightRadius   = 0.5 * pupilRight.offsetWidth;

    positionLeft  = parseInt( getComputedStyle( eyeballLeft ).left, 10 );
    positionRight = parseInt( getComputedStyle( eyeballRight ).left, 10 );

    update();
  }

  function onMouseMove( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    update();
  }

  function update() {
    pupilLeft.style.left = mouse.x + 'px';
    pupilLeft.style.top  = mouse.y + 'px';

    pupilRight.style.left = mouse.x + 'px';
    pupilRight.style.top  = mouse.y + 'px';

    var halfHeight = 0.5 * window.innerHeight;

    var dxLeft  = mouse.x - positionLeft,
        dxRight = mouse.x - positionRight,
        dy  = mouse.y - halfHeight;

    var distanceLeft = Math.sqrt( dxLeft * dxLeft + dy * dy );
    var angle;
    if ( distanceLeft > eyeballLeftRadius - pupilLeftRadius ) {
      angle = Math.atan2( dy, dxLeft );
      pupilLeft.style.left = positionLeft + ( eyeballLeftRadius - pupilLeftRadius ) * Math.cos( angle ) + 'px';
      pupilLeft.style.top  = halfHeight   + ( eyeballLeftRadius - pupilLeftRadius ) * Math.sin( angle ) + 'px';
    }

    var distanceRight = Math.sqrt( dxRight * dxRight + dy * dy );
    if ( distanceRight > eyeballRightRadius - pupilRightRadius ) {
      angle = Math.atan2( dy, dxRight );
      pupilRight.style.left = positionRight + ( eyeballRightRadius - pupilRightRadius ) * Math.cos( angle ) + 'px';
      pupilRight.style.top  = halfHeight    + ( eyeballRightRadius - pupilRightRadius ) * Math.sin( angle ) + 'px';
    }
  }

  resize();

  window.addEventListener( 'resize', resize );
  document.addEventListener( 'mousemove', onMouseMove );

}) ( window, document );
