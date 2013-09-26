/*globals define*/
define([
  'math/geometry',
  'input',
  'point'
], function( Geometry, Input, Point ) {
  'use strict';

  function Circle( x, y, radius ) {
    Point.call( this, x, y );
    this.radius = radius || 0;
  }

  Circle.prototype = new Point();
  Circle.prototype.constructor = Circle;

  Circle.prototype.draw = function( ctx ) {
    ctx.arc( this.x, this.y, this.radius, 0, Geometry.PI2 );
  };

  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var prevTime = Date.now(),
      currTime,
      running = true;

  var xCount = 25,
      yCount = 25;

  var iterationCount = 5;

  var spacing = 10;

  var maxSpeed = 300;

  var circle,
      points = [];

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function updatePoints( dt ) {
    var i, j;

    if ( circle.x !== circle.px || circle.y !== circle.py ) {
      for ( i = 0; i < xCount; i++ ) {
        var angle = -Math.PI * ( i / xCount );
        points[i].pin(
          circle.x + Math.cos( angle ) * ( circle.radius + spacing ),
          circle.y + Math.sin( angle ) * ( circle.radius + spacing )
        );
      }
    }

    i = iterationCount;
    var length = points.length;

    while( i-- ) {
      j = length;
      while ( j-- ) {
        points[j].resolve();
      }
    }

    points.forEach(function( point ) {
      point.update( dt );
    });
  }


  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    circle.px = circle.x;
    circle.py = circle.y;

    var mouseDistance = Geometry.distance( circle.x, circle.y, Input.mouse.x, Input.mouse.y );
    if ( mouseDistance > 1 ) {
      var dx = Input.mouse.x - circle.x,
          dy = Input.mouse.y - circle.y;

      var distanceInverse = 1 / mouseDistance;

      var speed = Math.min( 3 * mouseDistance, maxSpeed ) * dt;

      dx *= distanceInverse * speed;
      dy *= distanceInverse * speed;

      circle.x += dx;
      circle.y += dy;
    } else {
      circle.x = Input.mouse.x;
      circle.y = Input.mouse.y;
    }

    updatePoints( dt );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();

    circle.draw( ctx );
    points.forEach(function( point ) {
      point.draw( ctx );
    });

    ctx.stroke();
  }

  function init() {
    document.addEventListener( 'keydown', function( event ) {
      Input.onKeyDown( event );

      if ( Input.keys[ 27 ] ) {
        running = false;
        return;
      }
    });

    document.addEventListener( 'keyup', Input.onKeyUp );

    canvas.addEventListener( 'mousedown', Input.onMouseDown );
    canvas.addEventListener( 'mousemove', Input.onMouseMove );
    canvas.addEventListener( 'mouseup', Input.onMouseUp );

    circle = new Circle( canvas.width * 0.5, canvas.height * 0.5, 50 );
    Input.mouse.x = circle.x;
    Input.mouse.y = circle.y;

    var outerRadius = circle.radius + spacing;

    var i, j;
    var point;
    for ( j = 0; j < yCount; j++ ) {
      for ( i = 0; i < xCount; i++ ) {
        if ( j ) {
          var topPoint = points[ i + ( j - 1 ) * xCount ];
          point = new Point( topPoint.x, topPoint.y + spacing );
          point.attach( topPoint );
        } else {
          var angle = -Math.PI * ( i / xCount );
          point = new Point(
            circle.x + Math.cos( angle ) * outerRadius,
            circle.y + Math.sin( angle ) * outerRadius
          );
          point.pin( point.x, point.y );
        }

        if ( i ) {
          point.attach( points[ points.length - 1 ] );
        }

        points.push( point );
      }
    }

    context.lineWidth = 0.5;
    context.strokeStyle = 'black';

    tick();
  }

  init();
});
