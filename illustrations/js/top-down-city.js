(function( window, document, undefined ) {
  'use strict';

  var shadowColor = '#555',
      shadowBlur  = 0,
      shadowCount = 4;

  var shadows   = [].slice.call( document.getElementsByClassName( 'shadow' ) ),
      buildings = [].slice.call( document.getElementsByClassName( 'building' ) );

  (function() {
    var computedStyle = window.getComputedStyle( buildings[0] );
    console.log( computedStyle.width, computedStyle.height );
  }) ();

  // Push all shadows underneath the buildings.
  function resize() {
    var buildingsEl = document.getElementsByClassName( 'buildings' )[0];

    // Get buildings container offset.
    var buildingsTop  = buildingsEl.offsetTop,
        buildingsLeft = buildingsEl.offsetLeft;

    shadows.forEach(function( shadow, index ) {
      var building = buildings[ index ];

      shadow.style.top  = building.offsetTop  + buildingsTop + 'px';
      shadow.style.left = building.offsetLeft + buildingsLeft + 'px';
    });
  }

  function onMouseMoveAll( event ) {
    event.preventDefault();

    var computedStyle;
    var width, height;
    var halfSize;
    var x, y;
    shadows.forEach(function( shadow ) {
      computedStyle = window.getComputedStyle( shadow );

      width  = parseInt( computedStyle.width,  10 );
      height = parseInt( computedStyle.height, 10 );

      halfSize = 0.5 * Math.max( width, height );
      x = event.pageX - shadow.offsetLeft - halfSize;
      y = event.pageY - shadow.offsetTop  - halfSize;

      shadow.style.boxShadow = generateCSS( x, y, halfSize );
    });
  }

  function generateCSS( x, y, halfSize ) {
    var css = '';

    var length = Math.sqrt( x * x + y * y );

    var dx = -x / length * 32,
        dy = -y / length * 32;

    var shadowSpread;
    for ( var i = 0; i < shadowCount; i++ ) {
      // Increase shadow spread up to 1.25 of building size (0.5 * halfSize).
      shadowSpread = Math.round( 0.5 * ( i / shadowCount ) * halfSize );

      css += Math.round( ( i + 1 ) * dx ) + 'px ' +
        Math.round( ( i + 1 ) * dy ) + 'px ' +
        shadowBlur + 'px ' +
        shadowSpread + 'px ' +
        shadowColor;

      if ( i < shadowCount - 1 ) {
        css += ', ';
      }
    }

    return css;
  }

  resize();
  onMouseMoveAll({ pageX: 0, pageY: 0, preventDefault: function() {} });
  document.addEventListener( 'mousemove', onMouseMoveAll );
  document.addEventListener( 'touchmove', onMouseMoveAll );

  // Remove all event listeners.
  function onKeyDown( event ) {
    // ESC.
    if ( event.which === 27 ) {
      document.removeEventListener( 'mousemove', onMouseMoveAll );
      document.removeEventListener( 'touchmove', onMouseMoveAll );
      document.removeEventListener( 'keydown', onKeyDown );
      window.removeEventListener( 'resize', resize );
    }
  }

  document.addEventListener( 'keydown', onKeyDown );
  window.addEventListener( 'resize', resize );
}) ( window, document );
