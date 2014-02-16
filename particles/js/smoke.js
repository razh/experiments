(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = 640;
  canvas.height = 480;

  var smokeCanvas = document.createElement( 'canvas' ),
      smokeCtx    = smokeCanvas.getContext( '2d' );

  smokeCanvas.width = canvas.width;
  smokeCanvas.height = canvas.height;

  var particles = [];

  var prevTime = Date.now(),
      currTime;

  var running = false;

  var config = {
    wind: -500,
    density: 0.2
  };

  // Emitter source.
  var source = {
    x: 300,
    y: window.innerHeight - 100,
    radius: 30
  };

  function randomPointInCircle( x, y, radius ) {
    var r = radius * Math.sqrt( Math.random() ),
        theta = PI2 * Math.random();

    return {
      x: r * Math.cos( theta ) + x,
      y: r * Math.sin( theta ) + y
    };
  }

  function randomFloat( min, max ) {
    return min + Math.random() * ( max - min );
  }

  (function init() {
    var particleCount = 100;
    while ( particleCount-- ) {
      var point = randomPointInCircle( source.x, source.y, source.radius );

      particles.push({
        x: point.x,
        y: point.y,
        vx: 0,
        vy: 0,
        radius: randomFloat( 2, 10 )
      });
    }
  }) ();

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
      var dtSquared = dt * dt;
      particle.vx += config.wind * Math.random() * dtSquared;
      var inverseMass = 1 / ( 2 * Math.PI * particle.radius * config.density );
      particle.vy -= 10000 * dtSquared * inverseMass;

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      particle.radius += dt;

      if ( particle.x + particle.radius < 0 ||
           particle.y + particle.radius < 0 ) {
        var point = randomPointInCircle( source.x, source.y, source.radius );
        particle.x = point.x;
        particle.y = point.y;
        particle.vx = 0;
        particle.vy = 0;
        particle.radius = randomFloat( 2, 10 );
      }
    });
  }

  function drawParticles( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    ctx.beginPath();
    particles.forEach(function( particle ) {
      ctx.moveTo( particle.x, particle.y );
      ctx.arc( particle.x, particle.y, particle.radius, 0, PI2 );
    });

    ctx.fillStyle = '#555';
    ctx.fill();
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    drawParticles( smokeCtx );
    ctx.drawImage( smokeCanvas, 0, 0 );
  }

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  document.addEventListener( 'keydown', function( event ) {
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
}) ( window, document );
