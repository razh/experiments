(function( window, document, undefined ) {
  'use strict';

  var canvas, context;

  // Formation coordinates array.
  var formation = [];
  // Unit count.
  var count = 10;

  /*
    Three states for drawing a formation:

             <--  1. RANK  -->       ^
      ^      [] [] [] [] [] []       |
      |      [] [] [] [] [] []       |
    2. FILE  [] [] [] [] [] []       |
      |      [] [] [] [] [] []       |
      v      [] [] [] [] [] []  3. DIRECTION

      A rank is horizontal and a file is vertical. In the above diagram,
      the formation is 5 ranks deep and 6 files wide.
   */

  var State = {
    RANK: 0,
    FILE: 1,
    DIRECTION: 2
  };

  var state = State.RANK;

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

    ctx.beginPath();

    if ( mouse.down && state === State.RANK ) {
      ctx.moveTo( mouse.xi, mouse.yi );
      ctx.lineTo( mouse.x, mouse.y );
    } else if ( state === State.FILE ) {
      var x0 = formation[0][0],
          y0 = formation[0][1],
          x1 = formation[1][0],
          y1 = formation[1][1];

      var dx = x1 - x0,
          dy = y1 - y0;

      var angle = Math.atan2( -dy, dx );
      var rankWidth = Math.sqrt( dx * dx + dy * dy );

      var x2 = mouse.x - x1,
          y2 = mouse.y - y1;

      var cos, sin;
      var rx, ry;
      if ( angle ) {
        cos = Math.cos( angle );
        sin = Math.sin( angle );

        rx = cos * x2 - sin * y2;
        ry = sin * x2 + cos * y2;

        x2 = rx;
        y2 = ry;
      }

      ctx.save();

      ctx.fillText( Math.round( angle * 180 / Math.PI ), 300, 40 );

      ctx.translate( x0, y0 );
      ctx.rotate( -angle );

      ctx.rect( 0, 0, rankWidth, y2 );

      ctx.restore();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

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
      mousePosition( event );
      mouse.down = false;

      if ( state === State.RANK ) {
        var dx = mouse.x - mouse.xi,
            dy = mouse.y - mouse.yi;

        if ( !dx && !dy ) {
          return;
        }

        formation = [
          [ mouse.xi, mouse.yi ],
          [ mouse.x, mouse.y ]
        ];

        state = State.FILE;
      }
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

      // ESC.
      // Reset everything.
      if ( event.which === 27 ) {
        formation = [];
        state = State.RANK;
      }

      draw( context );
    });

    draw( context );
  }) ();
}) ( window, document );
