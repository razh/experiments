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

  var intervalEl = debugEl.querySelector( '.interval' );

  intervalEl.innerHTML = '0';

  function onResize() {
    var width  = window.innerWidth,
        height = window.innerHeight;

    var portrait = width < height;
    console.log( portrait );
  }

  function onDeviceOrientation( event ) {
    alphaEl.innerHTML = event.alpha.toFixed(2);
    betaEl.innerHTML  = event.beta.toFixed(2);
    gammaEl.innerHTML = event.gamma.toFixed(2);
  }

  function onDeviceMotion( event ) {
    var acceleration = event.acceleration;
    axEl.innerHTML = acceleration.x.toFixed(2);
    ayEl.innerHTML = acceleration.y.toFixed(2);
    azEl.innerHTML = acceleration.z.toFixed(2);

    var rotationRate = event.rotationRate;
    rotationRateAlphaEl.innerHTML = rotationRate.alpha.toFixed(2);
    rotationRateBetaEl.innerHTML  = rotationRate.beta.toFixed(2);
    rotationRateGammaEl.innerHTML = rotationRate.gamma.toFixed(2);

    // Refresh interval (in milliseconds).
    intervalEl.innerHTML = event.interval.toFixed(2);
  }

  onResize();
  window.addEventListener( 'resize', onResize );
  window.addEventListener( 'deviceorientation', onDeviceOrientation );
  window.addEventListener( 'devicemotion', onDeviceMotion );
}) ( window, document );
