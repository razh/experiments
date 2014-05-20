/*globals CCD*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 768;
  canvas.height = 768;

  var ccd = new CCD( 256, 256 );
  ccd.fromArray( [ 50, 60, 80, 30 ] );
  ccd.fromArray( [ 50, 50, 50, 50, 50, 50,50, 50 ] );

  var mouse = {
    x: 0,
    y: 0
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

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

    // Draw mouse point.
    ctx.beginPath();
    ctx.arc( mouse.x, mouse.y, 4, 0, 2 * Math.PI );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw links.
    ctx.beginPath();
    ccd.draw( ctx );
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
  }

  draw( context );

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  window.addEventListener( 'mousemove', function( event ) {
    mousePosition( event );
    ccd.set( mouse.x, mouse.y );
    draw( context );
  });

}) ( window, document );
