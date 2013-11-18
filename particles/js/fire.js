(function( window, document, undefined ) {
  'use strict';

  var running = false ;

  var canvas  = document.getElementById( 'fire-canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 640;
  canvas.height = 480;

  var rectWidth  = 200,
      rectHeight = 300;

  var particles = [];

  // Generate particles.
  (function() {
    var particleCount = 80;
    while ( particleCount-- ) {
      particles.push([
        // x.
        Math.random() * 300 + 200,
        // y.
        Math.random() * 300 + 200,
        // radius.
        Math.random() * 20 + 10,
        // vx.
        Math.random() * 40 - 20,
        // vy.
        -( Math.random() * 10 + 10 )
      ]);
    }
  }) ();

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, width, height );

    var tempCanvas = document.createElement( 'canvas' ),
        tempCtx    = tempCanvas.getContext( '2d' );

    tempCanvas.width = width;
    tempCanvas.height = height;

    var gradient = tempCtx.createLinearGradient( 0, 0, 0, height );
    gradient.addColorStop( 0, '#ff0' );
    gradient.addColorStop( 1, '#fff' );

    // Draw base rectangle.
    tempCtx.beginPath();
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect( 0.5 * ( width - rectWidth ), height - rectHeight, rectWidth, rectHeight );

    tempCtx.globalCompositeOperation = 'destination-out';

    particles.forEach(function( particle ) {
      tempCtx.beginPath();
      tempCtx.arc( particle[0], particle[1], particle[2], 0, 2 * Math.PI );
      tempCtx.fillStyle = 'white';
      tempCtx.fill();

      particle[0] += particle[3];
      particle[1] += particle[4];
      if ( particle[1] < 0 ) {
        particle[0] = Math.random() * 300 + 200;
        particle[1] = height + particle[2];
        particle[3] = Math.random() * 40 - 20;
        particle[4] = -( Math.random() * 10 + 10 );
      }
    });

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
