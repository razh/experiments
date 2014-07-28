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
  var averageVelocityField;
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
    averageVelocityField = createGrid( config.rows, config.cols );
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

  function convertDensityField(
    densityField, averageVelocityField,
    entities,
    density, falloff
  ) {
    var entity;
    // Entity properties.
    var x, y;
    var vx, vy;
    // Cell indices.
    var xi, yi;
    // Distance from entity to cell center.
    var dx, dy;
    // Cell densities.
    var pa, pb, pc, pd;
    for ( var i = 0; i < entities; i++ ) {
      entity = entities[i];
      x = entity.x;
      y = entity.y;
      vx = entity.vx;
      vy = entity.vy;

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

      densityField[ yi     ][ xi     ] += pa;
      densityField[ yi     ][ xi + 1 ] += pb;
      densityField[ yi + 1 ][ xi + 1 ] += pc;
      densityField[ yi + 1 ][ xi     ] += pd;

      // Add weighted velocity.
      averageVelocityField[ yi     ][ xi     ].x += vx * pa;
      averageVelocityField[ yi     ][ xi     ].y += vy * pa;
      averageVelocityField[ yi     ][ xi + 1 ].x += vx * pb;
      averageVelocityField[ yi     ][ xi + 1 ].y += vy * pb;
      averageVelocityField[ yi + 1 ][ xi + 1 ].x += vx * pc;
      averageVelocityField[ yi + 1 ][ xi + 1 ].y += vy * pc;
      averageVelocityField[ yi + 1 ][ xi     ].x += vx * pd;
      averageVelocityField[ yi + 1 ][ xi     ].y += vy * pd;
    }

    // Average weighted velocity.
    var rows = averageVelocityField.length,
        cols = averageVelocityField[0].length;

    var crowdDensity;
    for ( y = 0; y < rows; y++ ) {
      for ( x = 0; x < cols; x++ ) {
        crowdDensity = densityField[y][x];
        if ( crowdDensity ) {
          averageVelocityField[y][x].x /= crowdDensity;
          averageVelocityField[y][x].y /= crowdDensity;
        }
      }
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
