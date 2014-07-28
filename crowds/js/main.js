/*global Geometry, Entity*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 640;
  canvas.height = 480;

  function draw( ctx ) {
    ctx.fillStyle = '#000';
    ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
  }

  draw( context );

  var entities = [];

  var config = {
    cols: 32,
    rows: 32
  };

  var densityField;
  var speedField;

  function createGrid( rows ) {
    var array = [];

    for ( var i = 0; i < rows; i++ ) {
      array.push( [] );
    }

    return array;
  }

  function init() {
    densityField = createGrid( config.rows );
    speedField = createGrid( config.rows );

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

  init();

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

  function drawField( ctx, field ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var rows = field.length,
        cols = field[0].length;

    var colWidth  = width / cols,
        rowHeight = height / rows;

    var x, y;
    for ( y = 0; y < cols; y++ ) {
      for ( x = 0; x < rows; x++ ) {
        ctx.rect( x * colWidth, y * rowHeight, colWidth, rowHeight );
      }
    }
  }

}) ( window, document );
