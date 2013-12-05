(function( window, document, undefined ) {
  'use strict';

  var debugEl = document.querySelector( '.debug' );

  var rotationEl = debugEl.querySelector( '.rotation' );

  var alphaEl = rotationEl.querySelector( '.alpha' ),
      betaEl  = rotationEl.querySelector( '.beta' ),
      gammaEl = rotationEl.querySelector( '.gamma' );

  alphaEl.innerHTML = 'alpha';
  betaEl.innerHTML  = 'beta';
  gammaEl.innerHTML = 'gamma';

  var accelerationEl = debugEl.querySelector( '.acceleration' );

  var axEl = accelerationEl.querySelector( '.ax' ),
      ayEl = accelerationEl.querySelector( '.ay' ),
      azEl = accelerationEl.querySelector( '.az' );

  axEl.innerHTML = 'ax';
  ayEl.innerHTML = 'ay';
  azEl.innerHTML = 'az';

  var rotationRateEl = debugEl.querySelector( '.rotation-rate' );

  var rotationRateAlphaEl = rotationRateEl.querySelector( '.rotation-rate-alpha' ),
      rotationRateBetaEl  = rotationRateEl.querySelector( '.rotation-rate-beta' ),
      rotationRateGammaEl = rotationRateEl.querySelector( '.rotation-rate-gamma' );

  rotationRateAlphaEl.innerHTML = 'rate-alpha';
  rotationRateBetaEl.innerHTML  = 'rate-beta';
  rotationRateGammaEl.innerHTML = 'rate-gamma';

  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
  }

  function onResize() {
    var width  = window.innerWidth,
        height = window.innerHeight;

    var portrait = width < height;
    console.log( portrait );
  }

  function onDeviceOrientation( event ) {
    alphaEl.innerHTML = round( event.alpha, 2 );
    betaEl.innerHTML  = round( event.beta,  2 );
    gammaEl.innerHTML = round( event.gamma, 2 );

    var acceleration = event.acceleration;
    axEl.innerHTML = round( acceleration.x, 2 );
    ayEl.innerHTML = round( acceleration.y, 2 );
    azEl.innerHTML = round( acceleration.z, 2 );

    var rotationRate = event.rotationRate;
    rotationRateAlphaEl = round( rotationRate.alpha, 2 );
    rotationRateBetaEl  = round( rotationRate.beta,  2 );
    rotationRateGammaEl = round( rotationRate.gamma, 2 );
  }

  onResize();
  window.addEventListener( 'resize', onResize );
  window.addEventListener( 'deviceorientation', onDeviceOrientation );
}) ( window, document );
