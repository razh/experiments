/*globals Input, IK, CCD*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var ccd = new CCD();

  var config = {
    debug: false
  };

  var mouse = {
    x: 0,
    y: 0
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    if ( config.debug ) {
      // Draw debug points (with index labels).
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      ccd.debug.forEach(function( point, index ) {
        ctx.beginPath();
        ctx.arc( point[0], point[1], 2, 0, 2 * Math.PI );
        ctx.fill();
        ctx.fillText( index, point[0], point[1] );
      });

      ctx.fillStyle = ctx.strokeStyle = 'rgba(255, 128, 128, 0.5)';
      ccd.debugLines.forEach(function( line, index ) {
        ctx.beginPath();
        ctx.moveTo( line[0], line[1] );
        ctx.lineTo( line[2], line[3] );
        ctx.stroke();
        ctx.fillText( index, (line[0] + line[2]) / 2, (line[1] + line[3]) / 2);
      });
    }

    // Draw mouse point.
    ctx.beginPath();
    ctx.arc( mouse.x, mouse.y, 4, 0, 2 * Math.PI );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw links.
    ctx.beginPath();
    IK.draw( ctx, ccd );
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
  }


  function resize() {
    var width  = window.innerWidth,
        height = window.innerHeight;

    var radius = 0.5 * Math.min( width, height );

    canvas.width  = width;
    canvas.height = height;

    ccd.x = 0.5 * width;
    ccd.y = 0.5 * height;

    IK.fromArray( ccd, [ 0.2, 0.15, 0.3, 0.2 ].map(function( value ) {
      return value * radius;
    }));

    draw( context );
  }

  resize();

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  Input.on(function( event ) {
    mousePosition( event );
    IK.calculate( ccd );
    ccd.set( mouse.x, mouse.y );
    draw( context );
  });

  window.addEventListener( 'resize', resize );
  window.addEventListener( 'orientationchange', resize );

}) ( window, document );
