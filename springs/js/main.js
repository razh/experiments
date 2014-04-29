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


    // Canvas.
    var canvas  = document.createElement( 'canvas' ),
        context = canvas.getContext( '2d' );

    document.body.appendChild( canvas );

    canvas.width = 256;
    canvas.height = 128;

    function drawGridLines( ctx, spacing ) {
      var width  = ctx.canvas.width,
          height = ctx.canvas.height;

      var xCount = Math.ceil( width / spacing ),
          yCount = Math.ceil( height / spacing );

      var i;
      for ( i = 0; i <= xCount; i++ ) {
        ctx.moveTo( i * spacing, 0 );
        ctx.lineTo( i * spacing, height );
      }

      for ( i = 0; i <= yCount; i++ ) {
        ctx.moveTo( 0, i * spacing );
        ctx.lineTo( width, i * spacing );
      }
    }

    function drawScaleLines( ctx, scale ) {
      var width = ctx.canvas.width;

      ctx.moveTo( 0, scale );
      ctx.lineTo( width, scale );

      ctx.moveTo( 0, 0 );
      ctx.lineTo( width, 0 );

      ctx.moveTo( 0, -scale );
      ctx.lineTo( width, -scale );
    }

    var draw = (function() {
      var points = [];
      var quotient = 1;

      return function( ctx, scale, x, y ) {
        var width  = ctx.canvas.width,
            height = ctx.canvas.height;

        ctx.clearRect( 0, 0, width, height );

        // Wrap around.
        if ( ( x / width ) > quotient ) {
          var length = points.length;
          var px = points[ length - 2 ] - width,
              py = points[ length - 1 ];

          points = [ px, py ];
          quotient++;
        }

        x %= width;
        points.push( x, y );

        // Draw grid lines.
        ctx.beginPath();
        drawGridLines( ctx, height / 16 );
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();

        // Transform into position.
        ctx.save();
        ctx.translate( 0, 0.5 * height );
        ctx.scale( 1, -1 );

        // Draw scale lines.
        ctx.beginPath();
        drawScaleLines( ctx, scale );
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.stroke();

        // Draw text.
        ctx.save();
        ctx.scale( 1, -1 );

        ctx.font = '1em monospace';
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 2;

        ctx.fillText( 1, 8, -scale );
        ctx.fillText( 0, 8, 0 );
        ctx.fillText( -1, 0, scale );

        ctx.shadowBlur = 0;
        ctx.restore();

        // Draw path.
        ctx.beginPath();
        ctx.moveTo( points[0], points[1] * scale );
        for ( var i = 0, il = 0.5 * points.length; i < il; i++ ) {
          ctx.lineTo( points[ 2 * i ], points[ 2 * i + 1 ] * scale );
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.restore();
      };
    }) ();

    var timeScale = 0.5 * canvas.width;

    springs.x.on( 'update', function( spring ) {
      var state = spring.state;
      var parameter = ( state.position - spring.start ) / ( spring.end - spring.start );
      if ( Math.abs( spring.end - spring.start ) < spring.epsilon ) {
        parameter = 1;
      }

      draw( context, 32, spring.time * timeScale, parameter );
    });

  }) ();

}) ( window, document );
