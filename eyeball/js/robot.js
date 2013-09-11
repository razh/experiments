/*globals $*/
$(function() {
  'use strict';

  var PI2 = 2 * Math.PI;

  var $canvas = $( '#eyeball' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );

  var size = 500,
      halfSize = 0.5 * size;

  canvas.width  = size;
  canvas.height = size;

  var prevTime = Date.now(),
      currTime,
      running = true;

  var robot = {
    x: halfSize,
    y: halfSize,
    radius: 100,
    fill: '#ddd'
  };

  var ground = size - 70;

  var index = 0;

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

    dt *= 1e-3;

    index += dt;
    robot.y = halfSize + 30 * Math.sin( 3 * index );
  }

  function draw( ctx ) {
    ctx.fillStyle = '#eee';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    // Draw wings.
    var wingRadius = 1.25 * robot.radius;
    ctx.beginPath();
    ctx.moveTo( robot.x - wingRadius, robot.y );
    ctx.lineTo( robot.x + wingRadius, robot.y );
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ccc';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc( robot.x, robot.y, wingRadius, 0.75 * Math.PI, 1.25 * Math.PI );
    ctx.lineWidth = 9;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc( robot.x, robot.y, wingRadius, 0.25 * Math.PI, -0.25 * Math.PI, true );
    ctx.stroke();

    // Draw main body.
    ctx.beginPath();
    ctx.arc( robot.x, robot.y, robot.radius, 0, PI2 );
    ctx.fillStyle = robot.fill;
    ctx.fill();

    ctx.beginPath();
    ctx.arc( robot.x, robot.y, 100, -0.85, 2.19 );
    ctx.arc( robot.x - 29.4, robot.y - 23.17, 108.51, 1.84, -0.5, true );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();

    // Top-left eye.
    var eyeX = robot.x - 0.5 * robot.radius,
        eyeY = robot.y - 0.5 * robot.radius;

    ctx.beginPath();
    ctx.arc( eyeX, eyeY, 20, 0, PI2 );
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc( eyeX, eyeY, 15, 0, PI2 );
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc( eyeX, eyeY, 10, 0, PI2 );
    ctx.fillStyle = '#f44';
    ctx.fill();

    // Glimmer in top-left eye.
    ctx.beginPath();
    ctx.arc( eyeX, eyeY, 7, Math.PI, -0.5 * Math.PI );
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Main eye.
    var mainRadius = 0.4 * robot.radius;
    ctx.beginPath();
    ctx.arc( robot.x, robot.y, mainRadius, 0, PI2 );
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.beginPath();
    ctx.arc( robot.x, robot.y, mainRadius - 7, 0, PI2 );
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc( robot.x, robot.y, mainRadius - 13, 0, PI2 );
    ctx.fillStyle = '#334';
    ctx.fill();

    ctx.beginPath();
    ctx.arc( robot.x, robot.y, mainRadius - 18, Math.PI, -0.5 * Math.PI );
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#77c';
    ctx.stroke();

    drawShadow( ctx );
  }

  function drawShadow( ctx ) {
    ctx.save();
    ctx.beginPath();
    ctx.translate( 0, ground );
    ctx.scale( 1, 0.1 );
    ctx.arc( robot.x, 0, 0.7 * ( ground - robot.y ), 0, PI2 );
    ctx.fillStyle = '#aaa';
    ctx.fill();
    ctx.restore();
  }

  tick();
});
