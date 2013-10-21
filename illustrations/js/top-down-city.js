(function( window, document, undefined ) {
  'use strict';

  var shadowColor = '#555',
      shadowBlur  = '0',
      shadowCount = 64;

  var mouse = {
    x: 0,
    y: 0
  };

  var building = document.getElementsByClassName( 'building' )[0],

    buildingWidth  = building.clientWidth,
    buildingHeight = building.clientHeight,

    halfWidth  = 0.5 * buildingWidth,
    halfHeight = 0.5 * buildingHeight;

  var computedStyle = window.getComputedStyle( building );
  console.log( computedStyle.width, computedStyle.height );

  function onMouseMove( event ) {
    // Coordinates from center of building.
    mouse.x = event.pageX - building.offsetLeft - halfWidth;
    mouse.y = event.pageY - building.offsetTop  - halfHeight;

    building.style.boxShadow = generateCSS( mouse.x, mouse.y );
  }

  function generateCSS( x, y ) {
    var css = '';

    var length = Math.sqrt( x * x + y * y );

    var dx = -x / length * 16,
        dy = -y / length * 16;

    for ( var i = 0; i < shadowCount; i++ ) {
      css += Math.round( i * dx ) + 'px ' +
        Math.round( i * dy ) + 'px ' +
        shadowBlur + ' ' +
        Math.round( -( i / shadowCount ) * halfWidth ) + 'px ' +
        shadowColor;

      if ( i < shadowCount - 1 ) {
        css += ', ';
      }
    }

    return css;
  }

  onMouseMove({ pageX: 0, pageY: 0 });
  document.addEventListener( 'mousemove', onMouseMove );


  // Remove all event listeners.
  function onKeyDown( event ) {
    // ESC.
    if ( event.which === 27 ) {
      document.removeEventListener( 'mousemove', onMouseMove );
      document.removeEventListener( 'keydown', onKeyDown );
    }

  }

  document.addEventListener( 'keydown', onKeyDown );
}) ( window, document );
