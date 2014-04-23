(function( window, document, undefined ) {
  'use strict';

  var textElement = document.querySelector( '.text' );

  var inputs = {
    x: document.querySelector( 'input#x' ),
    y: document.querySelector( 'input#y' ),
    step: document.querySelector( 'input#step' )
  };

  var output = document.querySelector( '.output' );

  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
  }

  function textShadow() {
    var x = parseFloat( inputs.x.value ),
        y = parseFloat( inputs.y.value ),
        step = parseFloat( inputs.step.value );

    var shadows = [];

    // Step is the maximum number of pixels between shadows.
    var count = Math.max( Math.abs( x ), Math.abs( y ) ) / step;

    var dx = x / count,
        dy = y / count;

    var tx = 0,
        ty = 0;

    var i;
    for ( i = 0; i < count; i++ ) {
      tx += dx;
      ty += dy;
      shadows.push(
        round( tx, 2 ) + 'px ' +
        round( ty, 2 ) + 'px 0 #999'
      );
    }

    dx = -0.75;
    dy = 0.25;
    for ( i = 0; i < 2 * count; i++ ) {
      tx += dx;
      ty += dy;
      shadows.push(
        round( tx, 2 ) + 'px ' +
        round( ty, 2 ) + 'px 0 #555'
      );
    }

    var css = shadows.join( ', ' );
    output.textContent = css;
    return css;
  }

  // Add listeners.
  textElement.addEventListener( 'keydown', function() {
    textElement.style.textShadow = textShadow();
  });

  Object.keys( inputs ).forEach(function( key ) {
    var element = inputs[ key ];
    element.addEventListener( 'change', function() {
      textElement.style.textShadow = textShadow();
    });

    element.addEventListener( 'wheel', function() {
      textElement.style.textShadow = textShadow();
    });
  });

  // Add initial text shadow.
  textElement.style.textShadow = textShadow();

}) ( window, document );
