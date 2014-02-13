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
    DIRECTION: 3
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

  function Formation( x0, y0, x1, y1, x2, y2 ) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    // First edge (width).
    var dx = x1 - x0,
        dy = y1 - y0;

    this.angle = Math.atan2( -dy, dx );
    this.width = Math.sqrt( dx * dx + dy * dy );

    // Second edge (height).
    var point = this.toLocal( x2, y2 );
    this.height = point.y;

    Object.freeze( this );
  }

  Formation.prototype.applyTransform = function( ctx ) {
    ctx.translate( this.x0, this.y0 );
    ctx.rotate( -this.angle );
  };

  Formation.prototype.draw = function( ctx ) {
    ctx.save();

    this.applyTransform( ctx );
    ctx.rect( 0, 0, this.width, this.height );

    ctx.restore();
  };

  Formation.prototype.toWorld = function( x, y ) {
    var cos, sin;
    var rx, ry;

    if ( this.angle ) {
      cos = Math.cos( -this.angle );
      sin = Math.sin( -this.angle );

      rx = cos * x - sin * y;
      ry = sin * x + cos * y;

      x = rx;
      y = ry;
    }

    return {
      x: x + this.x0,
      y: y + this.y0
    };
  };

  Formation.prototype.toLocal = function( x, y ) {
    x -= this.x0;
    y -= this.y0;

    var cos, sin;
    var rx, ry;

    if ( this.angle ) {
      cos = Math.cos( this.angle );
      sin = Math.sin( this.angle );

      rx = cos * x - sin * y;
      ry = sin * x + cos * y;

      x = rx;
      y = ry;
    }

    return {
      x: x,
      y: y
    };
  };

  Formation.prototype.getPositions = function( count, rankSpacing, fileSpacing ) {
    var xCount = Math.ceil( this.width / rankSpacing );

    // Flip fileSpacing if height is negative.
    fileSpacing *= this.height < 0 ? -1 : 1;

    var positions = [];
    var i = 0;
    while ( i < count ) {
      positions.push({
        x: ( i % xCount ) * rankSpacing,
        y: Math.floor( i / xCount ) * fileSpacing
      });

      i++;
    }

    return positions;
  };

  /**
   * Unlike getPositions() which takes a predetermined unit count,
   * getPositionsFilled() fills the entire formation box with units
   * separated by the given spacing parameters.
   */
  Formation.prototype.getPositionsFilled = function( rankSpacing, fileSpacing ) {
    // Return empty array if zero-spacing (results in infinite unit count).
    if ( !rankSpacing || !fileSpacing ) {
      return [];
    }

    // Absolute value allow for positive yCounts if height is negative.
    var xCount = Math.ceil( this.width / rankSpacing ),
        yCount = Math.ceil( Math.abs( this.height ) / fileSpacing );

    return this.getPositions( xCount * yCount, rankSpacing, fileSpacing );
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

  /**
   * Draws a local unit position in world space.
   */
  function drawUnit( ctx, formation, localPosition ) {
    var position = formation.toWorld( localPosition.x, localPosition.y );

    ctx.beginPath();
    ctx.arc( position.x, position.y, 8, 0, PI2 );
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

    if ( mouse.down && state === State.RANK ) {
      ctx.beginPath();
      ctx.moveTo( mouse.xi, mouse.yi );
      ctx.lineTo( mouse.x, mouse.y );
      ctx.stroke();
    } else if ( state === State.FILE ) {
      drawRectFromPoints( ctx, x0, y0, x1, y1, mouse.x, mouse.y );
      ctx.stroke();
    } else if ( state === State.DIRECTION ) {
      drawRectFromPoints( ctx, x0, y0, x1, y1, x2, y2 );
      ctx.moveTo( x0, y0 );
      ctx.lineTo( mouse.x, mouse.y );
      ctx.moveTo( x1, y1 );
      ctx.lineTo( mouse.x, mouse.y );
      ctx.stroke();
    }

    // Debug text.
    ctx.fillText( 'state: ' + state, 32, 32 );
    ctx.fillText( 'count: ' + config.count, 32, 48 );
    ctx.fillText( 'rank spacing: ' + config.spacing.rank, 32, 64 );
    ctx.fillText( 'file spacing: ' + config.spacing.file, 32, 80 );
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

      if ( state === State.DEFAULT ) {
        state = State.RANK;
      } else if ( state === State.DIRECTION ) {
        formations.push(
          new Formation(
            formation[0][0], formation[0][1],
            formation[1][0], formation[1][1],
            formation[2][0], formation[2][1]
          )
        );

        clearFormation();
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
      var delta = 1;
      if ( event.shiftKey ) {
        delta = 10;
      }

      // A.
      if ( event.which === 65 ) {
        config.count += delta;
      }

      // Z.
      if ( event.which === 90 ) {
        config.count = Math.max( config.count - delta, 0 );
      }

      // Rank spacing.
      // Left arrow.
      if ( event.which === 37 ) {
        config.spacing.rank -= delta;
      }

      // Right arrow.
      if ( event.which === 39 ) {
        config.spacing.rank += delta;
      }

      // File spacing.
      // Up arrow.
      if ( event.which === 38 ) {
        config.spacing.file += delta;
      }

      // Down arrow.
      if ( event.which === 40 ) {
        config.spacing.file -= delta;
      }

      // ESC.
      // Reset everything.
      if ( event.which === 27 ) {
        clearFormation();
      }

      draw( context );
    });

    draw( context );
  }) ();
}) ( window, document );
