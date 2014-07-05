(function( window, documnet, undefined ) {
  'use strict';

  var material = {
    diffuse: null,
    normal: null
  };

  var diffuseEl = document.querySelector( '.diffuse' );
  var normalEl = document.querySelector( '.normal' );

  function onDrop( event, callback ) {
    var image = new Image();
    image.onload = callback.bind( image );
    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
  }

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    var target = event.target;
    onDrop( event, function() {
      if ( target === diffuseEl || target === normalEl ) {
        target.style.backgroundImage = 'url(' + this.src + ')';
      }
    });
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

}) ( window, document );
