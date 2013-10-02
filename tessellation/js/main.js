(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI,
      DEG_TO_RAD = Math.PI / 180,
      RAD_TO_DEG = 180 / Math.PI;

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

  var scale = {
    x: 50,
    y: 25
  };

  function update() {
    var x = Math.round( mouse.x * ( 1 / scale.x ) ),
        y = Math.round( mouse.y * ( 1 / scale.y ) );

    if ( !image[y] ) {
      image[y] = [];
    }

    image[y][x] = [ 0, 0, 0, 1.0 ];
  }

  var drawFn = function( ctx, x, y ) {
    ctx.save();

    if ( y % 2 ) {
      x *= scale.x;
      x += 0.5 * scale.x;
    } else {
      x *= scale.x;
    }

    ctx.translate( x, y * scale.y );
    ctx.rotate( 45 * DEG_TO_RAD );
    ctx.rect( 0, 0, 30, 30 );

    ctx.restore();
  };

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    image.forEach(function( row, rowIndex ) {
      row.forEach(function( col, colIndex ) {
        if ( !col ) {
          return;
        }

        ctx.beginPath();

        drawFn( ctx, colIndex, rowIndex );

        ctx.fillStyle = 'rgba(' +
          col[0] + ', ' +
          col[1] + ', ' +
          col[2] + ', ' +
          col[3] + ')';

        ctx.fill();
      });
    });
  }

  function onMouseDown() {
    mouse.down = true;
  }

  function onMouseMove( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    if ( mouse.down ) {
      update();
      draw( context );
    }
  }

  function onMouseUp() {
    mouse.down = false;
  }

  canvas.addEventListener( 'mousedown', onMouseDown );
  canvas.addEventListener( 'mousemove', onMouseMove );
  canvas.addEventListener( 'mouseup', onMouseUp );
}) ( window, document );
