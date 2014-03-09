(function( window, document, undefined ) {
  'use strict';

  var hslEl = document.createElement( 'div' );
  hslEl.classList.add( 'hsl' );
  document.body.appendChild( hslEl );

  window.addEventListener( 'mousemove', function( event ) {
    var x = event.pageX,
        y = event.pageY;

    var h = x / window.innerWidth * 360,
        s = ( window.innerHeight - y ) / window.innerHeight * 100,
        l = 50;

    var hsl = 'hsl(' +
      Math.round( h ) + ', ' +
      Math.round( s ) + '%, ' +
      Math.round( l ) + '%)';

    document.body.style.backgroundColor = hsl;
    hslEl.textContent = hsl;
  });
}) ( window, document );
