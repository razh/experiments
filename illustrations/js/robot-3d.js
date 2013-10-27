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
    var rx =   ( 0.5 - ( event.clientY / window.innerHeight ) ) * 180,
        ry =  -( 0.5 - ( event.clientX / window.innerWidth  ) ) * 180;

    var transform = 'rotateX( ' + rx + 'deg) rotateY( ' + ry + 'deg)';
    body.style.webkitTransform = transform;
    body.style.transform = transform;
  }

  onMouseMove({
    pageX: 0.5 * window.innerWidth,
    pageY: 0.5 * window.inenrHeight
  });

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
