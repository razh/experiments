(function( window, document, undefined ) {
  'use strict';

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  var paletteEl = document.querySelector( '.palette' );
  var hslEl = document.querySelector( '.hsl' );

  var h = 0,
      s = 50,
      l = 50;

  function hslString( h, s, l ) {
    return 'hsl(' +
      Math.round( h ) + ', ' +
      Math.round( s ) + '%, ' +
      Math.round( l ) + '%)';
  }

  function update() {
    var hsl = hslString( h, s, l );

    document.body.style.backgroundColor = hsl;
    hslEl.textContent = hsl;
  }

  // Update background color.
  window.addEventListener( 'mousemove', function( event ) {
    var x = event.pageX,
        y = event.pageY;

    h = x / window.innerWidth * 360;
    s = ( window.innerHeight - y ) / window.innerHeight * 100;

    update();
  });

  window.addEventListener( 'wheel', function( event ) {
    event.preventDefault();
    l = clamp( l - event.deltaY, 0, 100 );
    update();
  });

  update();

  // Add color to palette.
  function rectMouseDown( event ) {
    event.stopPropagation();

    var el = event.currentTarget;
    if ( el.parentNode ) {
      el.parentNode.removeChild( el );
      el.removeEventListener( 'mousedown', rectMouseDown );
    }
  }

  window.addEventListener( 'mousedown', function( event ) {
    var rectEl = document.createElement( 'div' );

    rectEl.classList.add( 'rect' );
    rectEl.style.backgroundColor = hslString( h, s, l );
    rectEl.addEventListener( 'mousedown', rectMouseDown );

    paletteEl.appendChild( rectEl );
  });

}) ( window, document );
