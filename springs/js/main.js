/*globals Spring, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  var inputs = {
    friction: document.querySelector( '#friction' ),
    tension: document.querySelector( '#tension' )
  };

  // Create springs for both axes.
  var springs = {
    x: new Spring( 40, 8 ),
    y: new Spring( 40, 8 )
  };

  inputs.friction.addEventListener( 'input', function() {
    var friction = inputs.friction.value;
    springs.x.quartzFriction( friction );
    springs.y.quartzFriction( friction );
  });

  inputs.tension.addEventListener( 'input', function() {
    var tension = inputs.tension.value;
    springs.x.quartzTension( tension );
    springs.y.quartzTension( tension );
  });

  // Create element with spring behavior.
  var element = document.createElement( 'div' );
  element.classList.add( 'spring' );

  function setTransform( el, x, y ) {
    var transform = 'translate3d(' +
      x + 'px, ' +
      y + 'px, 0)';

    el.style.webkitTransform = transform;
    el.style.transform = transform;
  }

  function moveTo( x, y ) {
    springs.x.setEnd( x );
    springs.y.setEnd( y );
  }

  function onTouch( event ) {
    moveTo( event.touches[0].pageX, event.touches[0].pageY );
  }

  if ( 'ontouchstart' in window ) {
    window.addEventListener( 'touchstart', onTouch );

    window.addEventListener( 'touchmove', function( event ) {
      event.preventDefault();
      onTouch( event );
    });
  } else {
    window.addEventListener( 'mousedown', function( event ) {
      moveTo( event.pageX, event.pageY );
    });
  }


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
