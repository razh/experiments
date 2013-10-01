(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var mouse = {
    x: 0,
    y: 0,
    down: false
  };

  // A 2D array consisting of pixel data in the format: [ r, g, b, a ].
  // Where rgb is [0, 255] and a is [0, 1].
  var image = [];

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    image.forEach(function( row, rowIndex ) {
      row.forEach(function( col, colIndex ) {
        ctx.beginPath();

        drawFn( width, height, colIndex, rowIndex );

        ctx.fillStyle = 'rgba(' +
          col[0] + ', ' +
          col[1] + ', ' +
          col[2] + ', ' +
          col[3] + ')';

        ctx.fill();
      });
    });

    var x, y;
    for ( y = 0; y < HEIGHT; y++ ) {
      for ( x = 0; x < WIDTH; x++ ) {

      }
    }
  }

  function onMouseDown() {
    mouse.down = true;
  }

  function onMouseMove( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    if ( mouse.down ) {
      draw( context );
    }
  }

  function onMouseUp() {
    mouse.down = false;
  }

  document.addEventListener( 'mousedown', onMouseDown );
  document.addEventListener( 'mousemove', onMouseMove );
  document.addEventListener( 'mouseup', onMouseUp );
}) ( window, document );
