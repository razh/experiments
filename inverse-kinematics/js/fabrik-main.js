/*globals Input, IK, Fabrik*/
(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var fabrik = new Fabrik();

  var mouse = {
    x: 0,
    y: 0
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Draw radius.
    ctx.beginPath();
    ctx.arc( fabrik.x, fabrik.y, IK.length( fabrik ), 0, PI2 );
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Draw mouse point.
    ctx.beginPath();
    ctx.arc( mouse.x, mouse.y, 4, 0, PI2 );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw links.
    ctx.beginPath();
    IK.drawPath( ctx, fabrik );
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

    fabrik.x = 0.5 * width;
    fabrik.y = 0.5 * height;

    IK.fromArray( fabrik, [ 0.2, 0.15, 0.3, 0.2 ].map(function( value ) {
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
    fabrik.set( mouse.x, mouse.y );
    draw( context );
  });

  window.addEventListener( 'resize', resize );
  window.addEventListener( 'orientationchange', resize );

}) ( window, document );
