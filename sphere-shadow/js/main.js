/*globals $, requestAnimationFrame*/
$(function() {
  'use strict';

  var selection = [];
  var offsets = [];
  var stage = [];

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
     * (x - xc)^2 + (y - yc)^2 - r^2 = 0
     *
     * We substitute the coords of the three points, and get three equations
     * for three unknowns:
     *
     * (x0 - xc)^2 + (y0 - yc)^2 - r^2 = 0
     * (x1 - xc)^2 + (y1 - yc)^2 - r^2 = 0
     * (x2 - xc)^2 + (y2 - yc)^2 - r^2 = 0
     *
     * Expanding this results in:
     *
     * x0^2 - 2(x0 * xc) + xc^2 + xc^2 + ... = 0
     *
     * Subtract the expanded versions
     */
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

    var PI2 = 2 * Math.PI;
    var DEG_TO_RAD = Math.PI / 180;
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
