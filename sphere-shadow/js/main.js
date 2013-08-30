/*globals $, requestAnimationFrame*/
$(function() {
  'use strict';

  var selection = [];
  var offsets = [];
  var stage = [];

  var PI2 = 2 * Math.PI;
  var DEG_TO_RAD = Math.PI / 180;

  var mouse = {
    x: null,
    y: null
  };

  var backgroundColor = '#222';

  function Rect( x, y, width, height ) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.width = width || 0.0;
    this.height = height || 0.0;
  }

  Rect.prototype.draw = function( ctx ) {
    ctx.beginPath();
    ctx.rect( this.x, this.y, this.width, this.height );
    ctx.fillStyle = 'rgba(0, 255, 0, 1.0)';
    ctx.fill();
  };

  Rect.prototype.contains = function( x, y ) {
    return this.x <= x && x <= this.x + this.width &&
           this.y <= y && y <= this.y + this.height;
  };

  function tick() {
    draw( context );
    requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    stage.forEach(function( object ) {
      object.draw( ctx );
    });

    var circle = circleFromPoints(
      stage[0].x, stage[0].y,
      stage[1].x, stage[1].y,
      stage[2].x, stage[2].y
    );

    if ( circle ) {
      ctx.beginPath();
      ctx.arc( circle.x, circle.y, circle.radius, 0, PI2 );
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

    // console.log(circle.x, circle.y, circle.radius)
  }

  function mousePosition( event ) {
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    };
  }

  function onMouseDown( event ) {
    mouse = mousePosition( event );

    var object;
    for ( var i = 0, il = stage.length; i < il; i++ ) {
      object = stage[i];
      if ( object.contains( mouse.x, mouse.y ) ) {
        selection.push( object );
        offsets.push({
          x: object.x,
          y: object.y
        });
      }
    }
  }

  function onMouseMove( event ) {
    var point = mousePosition( event );

    var dx = point.x - mouse.x,
        dy = point.y - mouse.y;

    selection.forEach(function( object, index ) {
      object.x = offsets[ index ].x + dx;
      object.y = offsets[ index ].y + dy;
    });
  }

  function onMouseUp() {
    selection = [];
    offsets = [];
  }

  function circleFromPoints( x0, y0, x1, y1, x2, y2 ) {
    /**
     * Given the equation of a circle located at (xc, yc) and with a radius r:
     *
     * (x - xc)^2 + (y - yc)^2 = r^2
     *
     * We substitute the coords of the three points, and get three equations
     * for three unknowns:
     *
     * (x0 - xc)^2 + (y0 - yc)^2 = r^2
     * (x1 - xc)^2 + (y1 - yc)^2 = r^2
     * (x2 - xc)^2 + (y2 - yc)^2 = r^2
     *
     * By subtracting the first from the second and third equations and
     * constructing a system of linear equations. With  some algebraic
     * manipulation, we eventually get:
     *
     * xc = [(x1^2 - y0^2) + (y1^2 - y0^2)] - (y1 - y0) /(y2 - y0) * [(x2^2 - x0^2) + (y2^2 - y0^2)]
     *      ----------------------------------------------------------------------------------------
     *                           2[x1 - x0 - (y1 - y0) / (y2 - y0) * (x2 - x0)]
     *
     * yc = [(x1^2 - y0^2) + (y1^2 - y0^2)] - (x1 - x0) /(x2 - x0) * [(x2^2 - x0^2) + (y2^2 - y0^2)]
     *      ----------------------------------------------------------------------------------------
     *                           2[y1 - y0 - (x1 - x0) / (x2 - x0) * (y2 - y0)]
     *
     * Plug xc and yc back in to solve for the radius.
     */

    var dx10 = x1 - x0,
        dy10 = y1 - y0,
        dx20 = x2 - x0,
        dy20 = y2 - y0;

    if ( dx20 === 0 || dy20 === 0 ) {
      if ( dx10 === 0 || dy10 === 0 ) {
        // Don't do anything if degenerate.
        return;
      }

      // Swap vars so it can work.
      var temp = x1;
      x1 = x2;
      x2 = temp;

      temp = y1;
      y1 = y2;
      y2 = temp;

      dx10 = x1 - x0;
      dy10 = y1 - y0;
      dx20 = x2 - x0;
      dy20 = y2 - y0;
    }

    // Differences of squares. e.g. x1^2 - x0^2.
    var dsqx10 = dx10 * ( x1 + x0 ),
        dsqy10 = dy10 * ( y1 + y0 ),
        dsqx20 = dx20 * ( x2 + x0 ),
        dsqy20 = dy20 * ( y2 + y0 );

    // Ratios, e.g. rdx10dx20 = (x1 - x0) / (x2 - x0).
    var rdx10dx20 = dx10 / dx20,
        rdy10dy20 = dy10 / dy20;

    // Denominators.
    var xden = 2 * ( dx10 - rdy10dy20 * dx20 ),
        yden = 2 * ( dy10 - rdx10dx20 * dy20 );

    if ( xden === 0 || yden === 0 ) {
      return;
    }

    var x = ( ( dsqx10 + dsqy10 ) - rdy10dy20 * ( dsqx20 + dsqy20 ) ) / xden,
        y = ( ( dsqx10 + dsqy10 ) - rdx10dx20 * ( dsqx20 + dsqy20 ) ) / yden;

    // Now solve for the radius.
    var r = Math.sqrt( ( x0 - x ) * ( x0 - x ) + ( y0 - y ) * ( y0 - y ) );

    return {
      x: x,
      y: y,
      radius: r
    };
  }

  var $canvas = $( '#canvas' );
  var canvas = $canvas[0];
  var context = canvas.getContext( '2d' );

  $canvas.on({
    mousedown: onMouseDown,
    mousemove: onMouseMove,
    mouseup: onMouseUp
  });

  stage.push(
    new Rect( 100, 100, 10, 10 ),
    new Rect( 50, 120, 10, 10 ),
    new Rect( 200, 100, 10, 10 )
  );

  $canvas.css( 'position', 'absolute' );
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  tick();

  function test( ctx ) {
    var ctx = canvas.getContext( '2d' );
    ctx.fillStyle = '#222';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    var x = 0.5 * canvas.width;
    var y = 0.5 * canvas.height;
    var radius = 100;
    ctx.beginPath();
    ctx.arc( x, y, radius, 0, PI2 );

    ctx.fillStyle = 'rgba(250, 120, 80, 1.0)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(
      x + Math.cos( 300 * DEG_TO_RAD ) * radius,
      y + Math.sin( 300 * DEG_TO_RAD ) * radius,
      10,
      10
    );

    ctx.rect(
       x + Math.cos( 100 * DEG_TO_RAD ) * radius,
       y + Math.sin( 100 * DEG_TO_RAD ) * radius,
       10,
       10
    );
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(
      x + Math.cos(0) * radius,
      y + Math.sin(0) * radius,
      5, 5
    );
    ctx.rect(
      x + Math.cos( 90 * DEG_TO_RAD ) * radius,
      y + Math.sin( 90 * DEG_TO_RAD ) * radius,
      5, 5
    );
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fill();

    ctx.beginPath();
    // ctx.arcTo(
    //   x + Math.cos( 300 * DEG_TO_RAD ) * radius,
    //   y + Math.sin( 300 * DEG_TO_RAD ) * radius,
    //   x + Math.cos( 100 * DEG_TO_RAD ) * radius,
    //   y + Math.sin( 100 * DEG_TO_RAD ) * radius,
    //   radius
    // );
    // ctx.arcTo(
    //   x + Math.cos( 100 * DEG_TO_RAD ) * radius,
    //   y + Math.sin( 100 * DEG_TO_RAD ) * radius,
    //   x + Math.cos( 300 * DEG_TO_RAD ) * radius,
    //   y + Math.sin( 300 * DEG_TO_RAD ) * radius,
    //   2 * radius
    // );
    var startAngle = 300;
    var endAngle = 1;
    // var x0 = x +

    ctx.arc( x, y, radius, 300 * DEG_TO_RAD, 100 * DEG_TO_RAD );
    ctx.arc( x - 100, y - 100, 2* radius, 80 * DEG_TO_RAD, 30 * DEG_TO_RAD, true );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillStyle = 'white';

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    // ctx.fill();
  }

  // test( context );
});
