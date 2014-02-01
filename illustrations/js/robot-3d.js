/**
 * Applies mouse-based 180-degree vertical and horizontal rotation to the
 * first '.body' element in the document.
 */
(function( window, document, undefined ) {
  'use strict';

  var body = document.getElementsByClassName( 'body' )[0],
      bodyTransition = window.getComputedStyle( body ).transition;

  // Offset the transform origin so rotateY revolves around
  // an axis outside of the body.
  var transformOrigin = '50% 50% 0';
  body.style.webkitTransformOrigin = transformOrigin;
  body.style.transformOrigin = transformOrigin;

  function onMouseMove( event ) {
    var rx = -( event.clientY / window.innerHeight - 0.5 ) * 180,
        ry =  ( event.clientX / window.innerWidth  - 0.5 ) * 180;

    var transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    body.style.webkitTransform = transform;
    body.style.transform = transform;
  }

  // Toggle on/off the mouse-controlled rotating camera.
  document.addEventListener( 'keydown', function( event ) {
    // Space.
    if ( event.which === 32 ) {
      if ( window.getComputedStyle( body ).transitionProperty !== 'none' ) {
        body.style.transition = 'none';

        transformOrigin = '0 0 0';
        body.style.webkitTransformOrigin = transformOrigin;
        body.style.transformOrigin = transformOrigin;

        document.addEventListener( 'mousemove', onMouseMove );
      } else {
        body.style.transition = bodyTransition;

        // Reset transform and transform origin.
        body.style.webkitTransform = '';
        body.style.transform = '';

        transformOrigin = '50% 50% 0';
        body.style.webkitTransformOrigin = transformOrigin;
        body.style.transformOrigin = transformOrigin;

        document.removeEventListener( 'mousemove', onMouseMove );
      }
    }
  });

}) ( window, document );
