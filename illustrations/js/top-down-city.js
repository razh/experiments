(function( window, document, undefined ) {
  'use strict';

  var shadowColor = '#555',
      shadowBlur  = '0',
      shadowCount = 200;

  var mouse = {
    x: 0,
    y: 0
  };

  var building = document.getElementsByClassName( 'building' )[0],

    buildingWidth  = building.clientWidth,
    buildingHeight = building.clientHeight,

    halfWidth  = 0.5 * buildingWidth,
    halfHeight = 0.5 * buildingHeight;


  function onMouseMove( event ) {
    // Coordinates from center of building.
    mouse.x = event.pageX - building.offsetLeft - halfWidth;
    mouse.y = event.pageY - building.offsetTop  - halfHeight;

    building.style.boxShadow = generateCSS();
  }

  function generateCSS() {
    var css = '';

    var length = Math.sqrt( mouse.x * mouse.x + mouse.y * mouse.y );

    var dx = -mouse.x / length,
        dy = -mouse.y / length;

    for ( var i = 0; i < shadowCount; i++ ) {
      css += Math.round( i * dx ) + 'px ' + Math.round( i * dy ) + 'px ' + shadowBlur + ' ' + shadowColor;
      if ( i < shadowCount - 1 ) {
        css += ', ';
      }
    }

    return css;
  }

  building.style.boxShadow = (function() {
    var css = '';

    for ( var i = 0; i < shadowCount; i++ ) {
      css += i + 'px ' + i + 'px ' + shadowBlur + ' ' + shadowColor;
      if ( i < shadowCount - 1 ) {
        css += ', ';
      }
    }

    return css;
  }) ();

  document.addEventListener( 'mousemove', onMouseMove );
}) ( window, document );
