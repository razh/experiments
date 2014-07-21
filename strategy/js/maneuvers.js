/*globals Formation*/
(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas, context;

  // Formations coordinates array.
  var formations = [];
  var formation = [];

  var config = {
    // Unit count.
    count: 20,
    radius: 8,
    spacing: {
      rank: 40,
      file: 70
    }
  };

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
    DEFAULT: 0,
    RANK: 1,
    FILE: 2,
    DIRECTION: 3,
    SELECT: 4
  };

  var state = State.DEFAULT;

  var mouse = {
    x: 0,
    y: 0,

    // Initial points.
    xi: 0,
    yi: 0,

    down: false
  };

  var selection = [];
  var offsets = [];

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

  /**
   * Draws a local unit position in world space.
   */
  function drawUnit( ctx, formation, localPosition ) {
    var position = formation.toWorld( localPosition.x, localPosition.y );

    ctx.beginPath();
    ctx.arc( position.x, position.y, config.radius, 0, PI2 );
    ctx.fill();
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.font = '10pt Monaco, "Courier Neue", Courier, monospace';

    // Mouse.
    ctx.beginPath();
    ctx.arc( mouse.x, mouse.y, 10, 0, PI2 );
    ctx.stroke();

    // Formations.
    formations.forEach(function( formation ) {
      ctx.globalAlpha = 1;

      ctx.beginPath();
      formation.draw( ctx );
      ctx.stroke();

      ctx.globalAlpha = 0.5;

      // Draw highlighted formations.
      if ( formation.contains( mouse.x, mouse.y ) ) {
        ctx.globalAlpha = 0.2;

        ctx.beginPath();
        formation.draw( ctx );
        ctx.fill();

        ctx.globalAlpha = 0.5;
      }

      // Unit positions.
      formation.getPositions(
        config.count,
        config.spacing.rank,
        config.spacing.file
      ).forEach(function( position ) {
        drawUnit( ctx, formation, position );
      });

      ctx.globalAlpha = 0.1;

      // Unit positions which fill the formation.
      formation.getPositionsFilled(
        config.spacing.rank,
        config.spacing.file
      ).forEach(function( position ) {
        drawUnit( ctx, formation, position );
      });

      ctx.globalAlpha = 1;
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
      ctx.fillText( 'formation angle: ' + Math.round( angle * 180 / Math.PI ) + '°', 224, 32 );
    }

    switch ( state ) {
      case State.RANK:
        if ( mouse.down ) {
          ctx.beginPath();
          ctx.moveTo( mouse.xi, mouse.yi );
          ctx.lineTo( mouse.x, mouse.y );
          ctx.stroke();
        }

        break;

      case State.FILE:
        drawRectFromPoints( ctx, x0, y0, x1, y1, mouse.x, mouse.y );
        ctx.stroke();
        break;

      case State.DIRECTION:
        drawRectFromPoints( ctx, x0, y0, x1, y1, x2, y2 );
        ctx.moveTo( x0, y0 );
        ctx.lineTo( mouse.x, mouse.y );
        ctx.moveTo( x1, y1 );
        ctx.lineTo( mouse.x, mouse.y );
        ctx.stroke();
        break;
    }

    // Debug text.
    var stateName = Object.keys( State )
      .filter(function( key ) {
        return State[ key ] === state;
      });

    ctx.fillText( 'state: ' + stateName, 32, 32 );
    ctx.fillText( 'count: ' + config.count, 32, 48 );
    ctx.fillText( 'radius: ' + config.radius, 32, 64 );
    ctx.fillText( 'rank spacing: ' + config.spacing.rank, 32, 80 );
    ctx.fillText( 'file spacing: ' + config.spacing.file, 32, 96 );
  }

  function clearFormation() {
    formation = [];
    state = State.DEFAULT;
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

      switch ( state ) {
        case State.DEFAULT:
          state = State.RANK;
          break;

        case State.DIRECTION:
          formations.push(
            new Formation(
              formation[0][0], formation[0][1],
              formation[1][0], formation[1][1],
              formation[2][0], formation[2][1]
            )
          );

          clearFormation();
          break;

        case State.SELECT:
          selection = formations.filter(function( formation ) {
            return formation.contains( mouse.x, mouse.y );
          });

          offsets = selection.map(function( formation ) {
            return {
              x: formation.x,
              y: formation.y
            };
          });
      }

      draw( context );
    });

    window.addEventListener( 'mousemove', function( event ) {
      mousePosition( event );

      if ( mouse.down && state === State.SELECT ) {
        var dx = mouse.x - mouse.xi,
            dy = mouse.y - mouse.yi;

        selection.forEach(function( formation, index ) {
          formation.x = offsets[ index ].x + dx;
          formation.y = offsets[ index ].y + dy;
        });
      }

      draw( context );
    });

    window.addEventListener( 'mouseup', function() {
      mousePosition( event );
      mouse.down = false;

      switch ( state ) {
        case State.RANK:
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
          break;

        case State.FILE:
          formation[2] = [ mouse.x, mouse.y ];
          state = State.DIRECTION;
          break;
      }
    });

    document.addEventListener( 'keydown', function( event ) {
      var delta = 1;
      if ( event.shiftKey ) {
        delta = 10;
      }

      switch ( event.which ) {
        // Unit count.
        // A.
        case 65:
          config.count += delta;
          break;

        // Z.
        case 90:
          config.count = Math.max( config.count - delta, 0 );
          break;

        // Rank spacing.
        // Left arrow.
        case 37:
          config.spacing.rank -= delta;
          break;

        // Right arrow.
        case 39:
          config.spacing.rank += delta;
          break;

        // File spacing.
        // Up arrow.
        case 38:
          config.spacing.file += delta;
          break;

        // Down arrow.
        case 40:
          config.spacing.file -= delta;
          break;

        // Radius.
        // (, and <)
        case 188:
          config.radius = Math.max( config.radius - delta, 1 );
          break;

        // (. and >)
        case 190:
          config.radius += delta;
          break;

        // Toggle on/off selection.
        // V.
        case 86:
          if ( state === State.SELECT ) {
            state = State.DEFAULT;
            selection = [];
            offsets = [];
          } else {
            state = State.SELECT;
          }

          break;

        // ESC.
        // Reset everything.
        case 27:
          clearFormation();
          break;
      }

      draw( context );
    });

    draw( context );
  }) ();
}) ( window, document );
