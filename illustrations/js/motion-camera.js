(function( window, document, undefined ) {
  'use strict';

  var debugEl = document.querySelector( '.debug' );

  var alphaEl = debugEl.querySelector( '.alpha' ),
      betaEl  = debugEl.querySelector( '.beta' ),
      gammaEl = debugEl.querySelector( '.gamma' );

  alphaEl.innerHTML = 'alpha';
  betaEl.innerHTML  = 'beta';
  gammaEl.innerHTML = 'gamma';

  function onResize() {
    var width  = window.innerWidth,
        height = window.innerHeight;

    var portrait = width < height;
    console.log( portrait );
  }

  function onDeviceOrientation( event ) {
    alphaEl.innerHTML = event.alpha;
    betaEl.innerHTML  = event.beta;
    gammaEl.innerHTML = event.gamma;
  }

  onResize();
  window.addEventListener( 'resize', onResize );
  window.addEventListener( 'deviceorientation', onDeviceOrientation );
}) ( window, document );
