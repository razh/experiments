(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var prevTime = Date.now(),
      currTime,
      running = true;

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

    this.x += this.vx + dt;
    this.y += this.vy + dt;

    if ( 0 > this.x ) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if ( this.x > width ) {
      this.x = width;
      this.vx = -this.vx;
    }

    if ( 0 > this.y ) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if ( this.y > height ) {
      this.y = height;
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

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    var minDistanceSquared = 10 * 10,
        maxDistanceSquared = 30 * 30;

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';

    points.forEach(function( point ) {
      var x0 = point.x,
          y0 = point.y;

      ctx.beginPath();
      ctx.rect( x0 - 1, y0 - 1, 2, 2 );
      ctx.fill();

      // Draw lines.
      var inRange = pointQuadtree.retrieve( x0 - 30, y0 - 30, 60, 60 );
      inRange.forEach(function( otherPoint ) {
        var x1 = otherPoint.x,
            y1 = otherPoint.y;

        if ( point !== otherPoint ) {
          var currDistanceSquared = distanceSquared( x0, y0, x1, y1 );
          if ( currDistanceSquared < maxDistanceSquared ) {
            ctx.moveTo( x0, y0 );
            ctx.lineTo( x1, y1 );

            if ( currDistanceSquared < minDistanceSquared ) {
              ctx.lineWidth = 1;
            } else {
              ctx.lineWidth = 0.2;
            }

            ctx.stroke();
          }
        }
      });
    });
  }

  function init() {
    var width  = canvas.width,
        height = canvas.height;

    var x, y, vx, vy;
    var pointCount = 100;
    while ( pointCount-- ) {
      x = Math.random() * width;
      y = Math.random() * height;
      vx = ( Math.random() > 0.5 ? 1 : -1 ) * ( Math.random() * 2 + 2 );
      vy = ( Math.random() > 0.5 ? 1 : -1 ) * ( Math.random() * 2 + 2 );
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
}) ( window, document );
