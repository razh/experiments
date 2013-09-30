(function( window, document, undefined ) {
  'use strict';

  var counters = [].slice.call( document.getElementsByClassName( 'counter' ) );

  document.addEventListener( 'mousemove', function( event ) {
    var x = Math.round( event.pageX / window.innerWidth * 100 );
    counters.forEach(function( counter ) {
      counter.innerHTML = x;
    });
  });

}) ( window, document );
