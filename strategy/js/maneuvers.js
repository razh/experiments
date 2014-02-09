(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas, context;

  // Formations coordinates array.
  var formations = [];
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

  function drawRectFromPoints( ctx, x0, y0, x1, y1, x2, y2 ) {
    // First edge (width).
    var dx0 = x1 - x0,
        dy0 = y1 - y0;

    var angle = Math.atan2( -dy0, dx0 );
    var width = Math.sqrt( dx0 * dx0 + dy0 * dy0 );

    // Second edge (height).
    var dx1 = x2 - x1,
        dy1 = y2 - y1;

    var cos, sin;
    var rx, ry;
    if ( angle ) {
      cos = Math.cos( angle );
      sin = Math.sin( angle );

      rx = cos * dx1 - sin * dy1;
      ry = sin * dx1 + cos * dy1;

      dx1 = rx;
      dy1 = ry;
    }

    ctx.save();

    ctx.translate( x0, y0 );
    ctx.rotate( -angle );

    ctx.beginPath();
    ctx.rect( 0, 0, width, dy1 );

    ctx.restore();
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.font = '16pt "Helvetica Neue", Helvetica, Arial, sans-serif';

    // Mouse.
    ctx.beginPath();
    ctx.arc( mouse.x, mouse.y, 10, 0, PI2 );
    ctx.stroke();

    // Formations.
    formations.forEach(function( formation ) {
      var x0 = formation[0][0],
          y0 = formation[0][1],
          x1 = formation[1][0],
          y1 = formation[1][1],
          x2 = formation[2][0],
          y2 = formation[2][1];

      drawRectFromPoints( ctx, x0, y0, x1, y1, x2, y2 );
      ctx.stroke();
    });

    var x0, y0,
        x1, y1,
        x2, y2;
    if ( formation.length ) {
      x0 = formation[0][0];
      y0 = formation[0][1];
      x1 = formation[1][0];
      y1 = formation[1][1];

      if ( formation.length > 2 ) {
        x2 = formation[2][0];
        y2 = formation[2][1];
      }

      var dx = x1 - x0,
          dy = y1 - y0;

      var angle = Math.atan2( -dy, dx );
      ctx.fillText( Math.round( angle * 180 / Math.PI ), 300, 40 );
    }

    if ( mouse.down && state === State.RANK ) {
      ctx.beginPath();
      ctx.moveTo( mouse.xi, mouse.yi );
      ctx.lineTo( mouse.x, mouse.y );
    } else if ( state === State.FILE ) {
      drawRectFromPoints( ctx, x0, y0, x1, y1, mouse.x, mouse.y );
    } else if ( state === State.DIRECTION ) {
      drawRectFromPoints( ctx, x0, y0, x1, y1, x2, y2 );
      ctx.moveTo( x0, y0 );
      ctx.lineTo( mouse.x, mouse.y );
      ctx.moveTo( x1, y1 );
      ctx.lineTo( mouse.x, mouse.y );
    }

    ctx.stroke();

    ctx.fillText( 'state: ' + state, 32, 32 );
    ctx.fillText( count, 32, 72 );
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

      if ( state === State.DIRECTION ) {
        formations.push( formation );
        formation = [];
        state = State.RANK;
      }
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
      } else if ( state === State.FILE ) {
        formation[2] = [ mouse.x, mouse.y ];
        state = State.DIRECTION;
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
