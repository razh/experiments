/*globals scaleTransform*/
(function() {
  'use strict';

  var scale = 0.2;
  var scaleBy = 1.01;
  var scaleEnd = 1.01;
  scaleTransform( '.face', scale );

  function tick() {
    scale *= scaleBy;

    if ( scale >= scaleEnd ) {
      [].forEach.call( document.querySelectorAll( '.face' ), function( el ) {
        el.style.webkitTransform = '';
        el.style.transform = '';
      });

      scaleTransform( '.face', scaleEnd );
      return;
    }

    scaleTransform( '.face', scaleBy );
    window.requestAnimationFrame( tick );
  }

  tick();
}) ( window, document );
