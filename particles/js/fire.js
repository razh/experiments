(function( window, document, undefined ) {
  'use strict';

  var running = false ;

  var canvas  = document.getElementById( 'fire-canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 640;
  canvas.height = 480;

  var rectWidth  = 100,
      rectHeight = 300;

  var leftParticles = [],
      rightParticles = [];

  function xRandom() {
    return Math.random() * rectWidth;
  }

  function yRandom() {
    return Math.random() * rectHeight;
  }

  function radiusRandom() {
    return Math.random() * 30 + 5;
  }

  function vxRandom() {
    return Math.random() * 4 - 2;
  }

  function vyRandom() {
    return -( Math.random() * 4 + 2 );
  }

  function randomParticle() {
    return {
      x: xRandom(),
      y: yRandom(),
      radius: radiusRandom(),
      vx: vxRandom(),
      vy:vyRandom()
    };
  }

  // Generate particles.
  (function() {
    var particleCount = 150;
    while ( particleCount-- ) {
      leftParticles.push( randomParticle() );
      rightParticles.push( randomParticle());
    }
  }) ();

  function drawParticles( ctx, particles ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    ctx.save();
    ctx.translate( 0.25 * rectWidth, 0 );

    particles.forEach(function( particle ) {
      ctx.beginPath();
      ctx.arc( particle.x, particle.y, particle.radius, 0, 2 * Math.PI );
      ctx.fillStyle = 'white';
      ctx.fill();

      particle.x += particle.vx;
      particle.y += particle.vy;
      if ( particle.x - particle.radius < 0 ) {
        particle.x = particle.radius;
        particle.vx = -particle.vx;
      }

      if ( particle.x + particle.radius > rectWidth ) {
        particle.x = rectWidth - particle.radius;
        particle.vx = -particle.vx;
      }

      if ( particle.y + particle.radius < 0 ) {
        particle.x = xRandom();
        particle.y = rectHeight + particle.radius;
        particle.vx = vxRandom();
        particle.vy = vyRandom();
      }
    });

    ctx.restore();
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, width, height );

    var tempCanvas = document.createElement( 'canvas' ),
        tempCtx    = tempCanvas.getContext( '2d' );

    tempCanvas.width  = width;
    tempCanvas.height = height;

    var gradient = tempCtx.createLinearGradient( 0, 0, 0, height );
    gradient.addColorStop( 0, '#ff0' );
    gradient.addColorStop( 1, '#fff' );

    var rectX = 0.5 * ( width - rectWidth ),
        rectY = height - rectHeight;

    // Draw base rectangle.
    tempCtx.beginPath();
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect( rectX, rectY, rectWidth, rectHeight );

    var leftCanvas = document.createElement( 'canvas' ),
        leftCtx    = leftCanvas.getContext( '2d' );

    leftCanvas.width  = 1.5 * rectWidth;
    leftCanvas.height = rectHeight;

    var rightCanvas = document.createElement( 'canvas' ),
        rightCtx    = rightCanvas.getContext( '2d' );

    rightCanvas.width  = 1.5 * rectWidth;
    rightCanvas.height = rectHeight;

    tempCtx.globalCompositeOperation = 'destination-out';

    drawParticles( leftCtx, leftParticles );
    drawParticles( rightCtx, rightParticles );

    var leftX = rectX - rectWidth + 0.5 * leftCanvas.width;
    var rightX = rectX + 0.5 * rectWidth + 0.5 * rightCanvas.width;
    var imageY = rectY + 0.5 * rectHeight;

    var angle = 10 * Math.PI / 180;
    var scaleX = 1.3;
    var scaleY = 1.5;

    tempCtx.save();
    tempCtx.translate( leftX, imageY );
    tempCtx.rotate( angle );
    tempCtx.scale( scaleX, scaleY );
    tempCtx.translate( -leftX, -imageY );
    tempCtx.drawImage( leftCanvas, rectX - rectWidth, rectY );
    tempCtx.restore();

    tempCtx.save();
    tempCtx.translate( rightX, imageY );
    tempCtx.rotate( -angle );
    tempCtx.scale( scaleX, scaleY );
    tempCtx.translate( -rightX, -imageY );
    tempCtx.drawImage( rightCanvas, rectX + 0.5 * rectWidth, rectY );
    tempCtx.restore();

    tempCtx.globalCompositeOperation = 'source-over';

    ctx.drawImage( tempCanvas, 0, 0 );
  }

  function tick() {
    if ( !running ) {
      return;
    }

    draw( context );
    window.requestAnimationFrame( tick );
  }

  // tick();
  document.addEventListener( 'keydown', function( event ) {
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
