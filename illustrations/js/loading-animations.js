(function( window, document, undefined ) {
  'use strict';

  var counter = document.getElementById( 'percentage' );

  document.addEventListener( 'mousemove', function( event ) {
    var x = Math.round( event.pageX / window.innerWidth * 100 );
    counter.innerHTML = x;
  });

}) ( window, document );
