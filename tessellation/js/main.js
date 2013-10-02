(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI,
      DEG_TO_RAD = Math.PI / 180,
      RAD_TO_DEG = 180 / Math.PI;

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var previewCanvas  = document.getElementById( 'preview-canvas' ),
      previewContext = previewCanvas.getContext( '2d' );

  previewCanvas.width = window.innerWidth;
  previewCanvas.height = window.innerHeight;

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

  /**
   * Transforms coordinates from image coords to screen coords.
   */
  var transformFn = function( x, y ) {
    x *= scale.x;
    if ( y % 2 ) {
      x += 0.5 * scale.x;
    }

    return {
      x: x,
      y: y * scale.y
    };
  };

  /**
   * Transforms screen coords to image coords.
   */
  var transformInverseFn = function( xInverse, yInverse ) {
    return {
      x: Math.round( xInverse * ( 1 / scale.x ) ),
      y: Math.round( yInverse * ( 1 / scale.y ) )
    };
  };

  function update() {
    var point = transformInverseFn( mouse.x, mouse.y );

    var x = point.x,
        y = point.y;

    if ( !image[y] ) {
      image[y] = [];
    }

    image[y][x] = [ 0, 0, 0, 1.0 ];
  }

  var drawFn = function( ctx, x, y ) {
    ctx.save();

    var point = transformFn( x, y );
    ctx.translate( point.x, point.y );
    ctx.rotate( 45 * DEG_TO_RAD );
    ctx.rect( 0, 0, 30, 30 );

    ctx.restore();
  };

  var drawPreviewFn = function( ctx, x, y ) {
    var coords = transformInverseFn( x, y );
    coords = transformFn( coords.x, coords.y );

    ctx.save();

    ctx.translate( coords.x, coords.y );
    ctx.rotate( 45 * DEG_TO_RAD );

    ctx.beginPath();
    ctx.rect( 0, 0, 30, 30 );

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'black';
    ctx.stroke();

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

    if ( !mouse.down ) {
      drawPreviewFn( ctx, mouse.x, mouse.y );
    }
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

    previewContext.clearRect( 0, 0, previewCanvas.width, previewCanvas.height );
    drawPreviewFn( previewContext, mouse.x, mouse.y );
  }

  function onMouseUp() {
    mouse.down = false;
  }

  canvas.addEventListener( 'mousedown', onMouseDown );
  canvas.addEventListener( 'mousemove', onMouseMove );
  canvas.addEventListener( 'mouseup', onMouseUp );
}) ( window, document );
