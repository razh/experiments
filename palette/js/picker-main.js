(function( window, document, undefined ) {
  'use strict';

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  var hslEl = document.createElement( 'div' );
  hslEl.classList.add( 'hsl' );
  document.body.appendChild( hslEl );

  var h = 0,
      s = 50,
      l = 50;

  function update() {
    var hsl = 'hsl(' +
      Math.round( h ) + ', ' +
      Math.round( s ) + '%, ' +
      Math.round( l ) + '%)';

    document.body.style.backgroundColor = hsl;
    hslEl.textContent = hsl;
  }

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
}) ( window, document );
