(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var particles = [];

  var particleWidth  = 1,
      particleHeight = 1;

  var drag = 0.99;

  var prevTime = Date.now(),
      currTime;

  var running = false;

  var mouse = {
    x: 0,
    y: 0,

    radius: 500,
    strength: 5000
  };

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  (function init() {
    var particleCount = 100000;
    while ( particleCount-- ) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0
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

    var width  = window.innerWidth,
        height = window.innerHeight;

    // Mouse attractor properties.
    var radiusSquared = mouse.radius * mouse.radius;
    var strength = mouse.strength;

    // Simple Euler integration.
    var dx, dy;
    var distanceSquared;
    var distanceInverse;
    // Force.
    var fx, fy;
    // Relative distance from mouse.
    var intensity;

    var particle;
    var i, il;
    for ( i = 0, il = particles.length; i < il; i++ ) {
      particle = particles[i];

      dx = mouse.x - particle.x;
      dy = mouse.y - particle.y;

      if ( !dx && !dy ) {
        continue;
      }

      distanceSquared = dx * dx + dy * dy;
      if ( distanceSquared < radiusSquared ) {
        intensity = 1 - distanceSquared / radiusSquared;
        distanceInverse = 1 / Math.sqrt( distanceSquared );
        fx = dx * distanceInverse * intensity * strength;
        fy = dy * distanceInverse * intensity * strength;

        particle.vx += fx * dt;
        particle.vy += fy * dt;
      }

      particle.vx *= drag;
      particle.vy *= drag;

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      particle.x = clamp( particle.x, 0, width - 1 );
      particle.y = clamp( particle.y, 0, height - 1 );
    }
  }

  function drawParticles( ctx ) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#f43';

    particles.forEach(function( particle ) {
      ctx.beginPath();
      ctx.rect( particle.x, particle.y, particleWidth, particleHeight );
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draws pixels to imageData rather than using fill().
   *
   * Allows for a far greater number of particles, but suffers at higher
   * resolutions where there is a greater number of pixels.
   */
  function drawParticlesImageData( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var red   = 255,
        green = 68,
        blue  = 51,
        alpha = 128;

    // createImageData() is faster than getImageData() at higher resolutions.
    //
    // Both methods appear to suffer a problem wherein performance drops
    // significantly after a period of execution (perhaps memory-related?).
    //
    // var imageData = ctx.getImageData( 0, 0, width, height );
    var imageData = ctx.createImageData( width, height );
    var data = imageData.data;

    var particle;
    var index;
    var x, y;
    var i, il;
    for ( i = 0, il = particles.length; i < il; i++ ) {
      particle = particles[i];

      x = Math.floor( particle.x );
      y = Math.floor( particle.y );

      index = 4 * ( y * width + x );

      // Image data is an Uint8ClampedArray, automatically clamped.
      data[ index     ] += red;
      data[ index + 1 ] += green;
      data[ index + 2 ] += blue;
      data[ index + 3 ] += alpha;
    }

    ctx.putImageData( imageData, 0, 0 );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // drawParticles( ctx );

    // Particle count of about 10000, but should be able to go up to 50k.
    drawParticlesImageData( ctx );
  }

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  window.addEventListener( 'mousemove', function( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  });

  document.addEventListener( 'keydown', function() {
    // Space.
    if ( event.which === 32 ) {
      running = !running;
      if ( running ) {
        prevTime = Date.now();
        tick();
      }
    }
  });

  window.addEventListener( 'blur', function() {
    running = false;
  });

  window.addEventListener( 'resize', function() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

}) ( window, document );
