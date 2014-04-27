/*globals Spring, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var inputs = {
    tension: document.querySelector( '#tension' ),
    friction: document.querySelector( '#friction' )
  };

  // Create element with spring behavior.
  var element = document.createElement( 'div' );
  element.classList.add( 'spring' );

  // Create springs for both axes.
  var springs = {
    x: new Spring( 30, 3 ),
    y: new Spring( 30, 3 )
  };

  function setTransform( el, x, y ) {
    var transform = 'translate3d(' +
      x + 'px, ' +
      y + 'px, 0)';

    el.style.webkitTransform = transform;
    el.style.transform = transform;
  }

  window.addEventListener( 'mousedown', function( event ) {
    springs.x.setEnd( event.pageX );
    springs.y.setEnd( event.pageY );
  });


  (function() {
    var prevTime = Date.now(),
        currTime;

    var halfWidth  = 0.5 * window.innerWidth,
        halfHeight = 0.5 * window.innerHeight;

    // Set initial spring state.
    springs.x.start = halfWidth;
    springs.x.end = halfWidth;
    springs.x.state.position = halfWidth;

    springs.y.start = halfHeight;
    springs.y.end = halfHeight;
    springs.y.state.position = halfHeight;

    // Style element and add to DOM.
    setTransform( element, halfWidth, halfHeight );
    document.body.insertBefore( element, document.body.firstChild );

    function animate() {
      currTime = Date.now();
      var dt = currTime - prevTime;
      prevTime = currTime;

      springs.x.update( dt );
      springs.y.update( dt );

      setTransform( element, springs.x.state.position, springs.y.state.position );

      requestAnimationFrame( animate );
    }

    animate();
  }) ();

}) ( window, document );
