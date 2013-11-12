/*globals define*/
define([
  'level/level',
  'data',
  'math/geometry'
], function( Level, Data, Geometry ) {
  'use strict';

  console.log( 'An implementation of Amit Patel\'s 2d visibility algorithm.' );
  console.log( 'http://www.redblobgames.com/articles/visibility/' );

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var prevTime = Date.now(),
      currTime,
      running = true;

  var level = new Level();

  var mouse = {
    x: 200,
    y: 200
  };

  var size = 400,
      margin = 20;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    level.draw( ctx );

    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc( level.light.x, level.light.y, 5, 0, Geometry.PI2 );
    ctx.fill();

    ctx.beginPath();
    var x0, y0, x1, y1;
    for ( var i = 0, il = level.output.length; i < il; i += 2 ) {
      x0 = level.output[i].x;
      y0 = level.output[i].y;
      x1 = level.output[ i + 1 ].x;
      y1 = level.output[ i + 1 ].y;

      ctx.moveTo( level.light.x, level.light.y );
      ctx.lineTo( x0, y0 );
      ctx.lineTo( x1, y1 );
      ctx.lineTo( level.light.x, level.light.y );
    }

    ctx.fillStyle = 'rgba(255, 255, 0, 0.25)';
    ctx.fill();
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    level.lightPosition( mouse.x, mouse.y );
    level.sweep( Math.PI );
  }

  function init() {
    level.load( size, margin, [], Data.mazeWalls );
    tick();
  }

  function setMouse( x, y ) {
    mouse.x = Geometry.limit( x, margin + 1e-2, size - margin - 1e-2 );
    mouse.y = Geometry.limit( y, margin + 1e-2, size - margin - 1e-2 );
  }

  canvas.addEventListener( 'mousemove', function( event ) {
    setMouse(
      event.pageX - canvas.offsetLeft,
      event.pageY - canvas.offsetTop
    );
  });

  // Touch handlers.
  canvas.addEventListener( 'touchstart', function( event ) {
    setMouse(
      event.touches[0].pageX - canvas.offsetLeft,
      event.touches[0].pageY - canvas.offsetTop
    );
  });

  canvas.addEventListener( 'touchmove', function( event ) {
    event.preventDefault();
    setMouse(
      event.touches[0].pageX - canvas.offsetLeft,
      event.touches[0].pageY - canvas.offsetTop
    );
  });

  canvas.addEventListener( 'touchend', function( event ) {
    if ( !event.touches.length ) {
      return;
    }
    setMouse(
      event.touches[0].pageX - canvas.offsetLeft,
      event.touches[0].pageY - canvas.offsetTop
    );
  });

  document.addEventListener( 'keydown', function( event ) {
    // ESC.
    if ( event.which === 27 ) {
      running = false;
    }

    // Space.
    if ( event.which === 32 ) {
      running = true;
      tick();
    }
  });

  window.addEventListener( 'blur', function() {
    running = false;
  });

  init();
});
