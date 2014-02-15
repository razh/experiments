(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var particles = [];

  var prevTime = Date.now(),
      currTime;

  var running = false;

  (function init() {
    var particleCount = 200;
    while ( particleCount-- ) {
      particles.push({
        x: 0,
        y: 0
      });
    }
  } ());

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    // Maximum frame time.
    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Milliseconds to seconds.
    dt *= 1e-3;

    particles.forEach(function( particle ) {
    });
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
  }

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  document.addEventListener( 'keydown', function() {
    // ESC.
    if ( event.which === 27 ) {
      running = false;
    }

    // Space.
    if ( event.which === 32 ) {
      if ( !running ) {
        running = true;
        tick();
      }
    }
  });

  window.addEventListener( 'blur', function() {
    running = false;
  });

}) ( window, document );
