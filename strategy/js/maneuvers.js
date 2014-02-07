(function( window, document, undefined ) {
  'use strict';

  var canvas, context;

  var count = 10;

  var mouse = {
    x: 0,
    y: 0,

    // Initial points.
    xi: 0,
    yi: 0,

    down: false
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.font = '16pt "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText( count, 32, 32 );
  }

  (function init() {
    canvas  = document.createElement( 'canvas' );
    context = canvas.getContext( '2d' );

    document.body.appendChild( canvas );

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    function mousePosition( event ) {
      mouse.x = event.pageX - canvas.offsetLeft;
      mouse.y = event.pageY - canvas.offsetTop;
    }

    window.addEventListener( 'mousedown', function( event ) {
      mousePosition( event );
      mouse.xi = mouse.x;
      mouse.yi = mouse.y;

      mouse.down = true;
    });

    window.addEventListener( 'mousemove', function( event ) {
      mousePosition( event );
      draw( context );
    });

    window.addEventListener( 'mouseup', function() {
      mouse.down = false;
    });

    document.addEventListener( 'keydown', function( event ) {
      // Up arrow.
      if ( event.which === 38 ) {
        count++;
      }

      // Down arrow.
      if ( event.which === 40 ) {
        count = Math.max( count - 1, 0 );
      }

      draw( context );
    });

    draw( context );
  }) ();
}) ( window, document );
