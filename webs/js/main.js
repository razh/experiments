/*globals Quadtree*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var prevTime = Date.now(),
      currTime,
      running = true;

  var padding = 10;

  var points = [],
      pointQuadtree = new Quadtree( 0, 0, Math.max( canvas.width, canvas.height ) );

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function Point( x, y, vx, vy ) {
    this.x = x || 0;
    this.y = y || 0;

    this.vx = vx || 0;
    this.vy = vy || 0;
  }

  Point.prototype.update = function( dt ) {
    var width  = canvas.width,
        height = canvas.height;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if ( padding > this.x ) {
      this.x = padding;
      this.vx = -this.vx;
    }

    if ( this.x > width - padding ) {
      this.x = width - padding;
      this.vx = -this.vx;
    }

    if ( padding > this.y ) {
      this.y = padding;
      this.vy = -this.vy;
    }

    if ( this.y > height - padding ) {
      this.y = height - padding;
      this.vy = -this.vy;
    }
  };

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Convert milliseconds to seconds.
    dt *= 1e-3;

    points.forEach(function( point ) {
      point.update( dt );
    });

    pointQuadtree.clear();
    pointQuadtree.insertAll( points );
  }

  function drawSegment( ctx, lineWidth, segment ) {
    ctx.beginPath();
    ctx.moveTo( segment[0].x, segment[0].y );
    ctx.lineTo( segment[1].x, segment[1].y );
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    var minDistanceSquared = 10 * 10,
        maxDistanceSquared = 30 * 30;

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';

    var thinLines  = [],
        thickLines = [];

    ctx.beginPath();
    var count = 0;
    points.forEach(function( point ) {
      var x0 = point.x,
          y0 = point.y;

      ctx.rect( x0 - 1, y0 - 1, 2, 2 );

      // Draw lines.
      var inRange = pointQuadtree.retrieve( x0 - 30, y0 - 30, 60, 60 );
      count += inRange.length;
      inRange.forEach(function( otherPoint ) {
        var x1 = otherPoint.x,
            y1 = otherPoint.y;

        if ( point !== otherPoint ) {
          var currDistanceSquared = distanceSquared( x0, y0, x1, y1 );
          if ( currDistanceSquared < maxDistanceSquared ) {
            if ( currDistanceSquared < minDistanceSquared ) {
              thickLines.push( [ point, otherPoint ] );
            } else {
              thinLines.push( [ point, otherPoint ] );
            }
          }
        }
      });
    });
    ctx.fill();


    thinLines.forEach( drawSegment.bind( null, ctx, 0.1 ) );
    thickLines.forEach( drawSegment.bind( null, ctx, 0.5 ) );

    ctx.font = '100 24px Helvetica Neue';
    ctx.fillText( 'thin: ' + thinLines.length + ', thick: ' + thickLines.length + ', comparisons: ' + count, 10, 30 );
  }

  function init() {
    var width  = canvas.width,
        height = canvas.height;

    var x, y, vx, vy;
    var pointCount = 250;
    while ( pointCount-- ) {
      x = Math.random() * width;
      y = Math.random() * height;
      vx = ( Math.random() > 0.5 ? 1 : -1 ) * ( Math.random() * 50 + 25 );
      vy = ( Math.random() > 0.5 ? 1 : -1 ) * ( Math.random() * 50 + 25 );
      points.push( new Point( x, y, vx, vy ) );
    }

    tick();
  }

  init();

  document.addEventListener( 'keydown', function( event ) {
    // ESC.
    if ( event.which === 27 ) {
      running = false;
    }
  });

  window.addEventListener( 'resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pointQuadtree.size = Math.max( canvas.width, canvas.height );
    pointQuadtree.halfSize = 0.5 * pointQuadtree.size;
  });
}) ( window, document );
