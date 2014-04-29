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

    // Canvas.
    var canvas  = document.createElement( 'canvas' ),
        context = canvas.getContext( '2d' );

    document.body.appendChild( canvas );

    canvas.width = 240;
    canvas.height = 128;

    var draw = (function() {
      var px = 0,
          py = 0;

      var quotient = 1;

      return function( ctx, scale, x, y ) {
        var width  = ctx.canvas.width,
            height = ctx.canvas.height;

        if ( ( x / width ) > quotient ) {
          ctx.clearRect( 0, 0, width, height );
          px -= width;
          quotient++;
        }

        x %= width;

        ctx.save();
        ctx.translate( 0, 0.5 * height );
        ctx.scale( 1, -1 );

        // Draw scale lines.
        ctx.beginPath();
        ctx.moveTo( 0, scale );
        ctx.lineTo( width, scale );
        ctx.moveTo( 0, 0 );
        ctx.lineTo( width, 0 );
        ctx.moveTo( 0, -scale );
        ctx.lineTo( width, -scale );
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.stroke();

        // Draw path.
        ctx.beginPath();
        ctx.moveTo( px, py * scale );
        ctx.lineTo( x, y * scale );


        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.restore();

        px = x;
        py = y;
      };
    }) ();

    function animate() {
      currTime = Date.now();
      var dt = currTime - prevTime;
      prevTime = currTime;

      springs.x.update( dt );
      springs.y.update( dt );

      setTransform( element, springs.x.state.position, springs.y.state.position );

      requestAnimationFrame( animate );
    }

    springs.x.on( 'update', function( spring ) {
      var state = spring.state;
      var parameter = ( state.position - spring.start ) / ( spring.end - spring.start );
      if ( !( spring.end - spring.start ) ) {
        parameter = 1;
      }

      draw( context, 30, spring.time * 100, parameter );
    });

    animate();
  }) ();

}) ( window, document );
