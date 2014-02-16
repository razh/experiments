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

    radius: 1000,
    strength: 2000
  };

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  (function init() {
    var particleCount = 500;
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
    particles.forEach(function( particle ) {
      var dx = mouse.x - particle.x,
          dy = mouse.y - particle.y;

      if ( !dx && !dy ) {
        return;
      }

      var distanceSquared = dx * dx + dy * dy;
      var distanceInverse;
      // Force.
      var fx, fy;
      // Relative distance from mouse.
      var intensity;
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

      particle.x = clamp( particle.x, 0, width );
      particle.y = clamp( particle.y, 0, height );
    });
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#f43';

    particles.forEach(function( particle ) {
      ctx.beginPath();
      ctx.rect( particle.x, particle.y, particleWidth, particleHeight );
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
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
