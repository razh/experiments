/*global requestAnimationFrame, Geometry, Entity*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 640;
  canvas.height = 480;

  var prevTime = Date.now(),
      currTime;

  var entities = [];

  var config = {
    cols: 16,
    rows: 16
  };

  var densityField;
  var speedField;

  function createGrid( rows, cols ) {
    var array = new Array( rows );

    for ( var i = 0; i < rows; i++ ) {
      array[i] = new Array( cols );
    }

    return array;
  }

  function init() {
    densityField = createGrid( config.rows, config.cols );
    speedField = createGrid( config.rows, config.cols );

    var entityCount = 60;
    while ( entityCount-- ) {
      entities.push(
        new Entity(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      );
    }
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    // Limit max frame time.
    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Milliseconds to seconds.
    dt *= 1e-3;

    entities.forEach(function( entity ) {
      entity.update( dt );
    });
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    ctx.save();

    ctx.beginPath();
    drawField( ctx, densityField, width, height, 2 );
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#f98';
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    entities.forEach(function( entity ) {
      ctx.beginPath();
      entity.draw( ctx, 8 );
      ctx.stroke();
    });
  }

  function tick() {
    update();
    draw( context );
    requestAnimationFrame( tick );
  }

  function convertDensityField( field, entities, density, falloff ) {
    var entity;
    var x, y;
    var xi, yi;
    var dx, dy;
    var pa, pb, pc, pd;
    for ( var i = 0; i < entities; i++ ) {
      entity = entities[i];
      x = entity.x;
      y = entity.y;

      // Splat entity.
      // Find closest cell center whose coordinates are both less than entity.
      // Transform to cell center space.
      x -= 0.5;
      y -= 0.5;

      xi = Math.floor( x );
      yi = Math.floor( y );

      dx = x - xi;
      dy = y - yi;

      /*
           x --->
        y  +-------+-------+
        |  |       |       |
        v  |   A   |   B   |
           |       |       |
           +-------+-------+
           |       |       |
           |   D   |   C   |
           |       |       |
           +-------+-------+
       */

      pa = Math.pow( Math.min( 1 - dx, 1 - dy ), falloff );
      pb = Math.pow( Math.min(     dx, 1 - dy ), falloff );
      pc = Math.pow( Math.min(     dx,     dy ), falloff );
      pd = Math.pow( Math.min( 1 - dx,     dy ), falloff );

      field[ yi     ][ xi     ] += pa;
      field[ yi     ][ xi + 1 ] += pb;
      field[ yi + 1 ][ xi + 1 ] += pc;
      field[ yi + 1 ][ xi     ] += pd;
    }
  }

  function drawField( ctx, field, width, height, margin ) {
    margin = margin || 0;

    var rows = field.length,
        cols = field[0].length;

    var colWidth  = width / cols,
        rowHeight = height / rows;

    var x, y;
    for ( y = 0; y < cols; y++ ) {
      for ( x = 0; x < rows; x++ ) {
        ctx.rect(
          x * colWidth + margin, y * rowHeight + margin,
          colWidth - margin, rowHeight - margin
        );
      }
    }
  }

  init();
  draw( context );

}) ( window, document );
