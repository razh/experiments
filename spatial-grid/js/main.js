/*globals
canvas, context,
points,
update, draw, init,
rect, drawRect,
SpatialGrid*/
(function( window, document, undefined ) {
  'use strict';

  SpatialGrid.prototype.draw = function( ctx ) {
    var cellWidth  = this.cellWidth,
        cellHeight = this.cellHeight;

    var x, y;
    for ( var i = 0, il = this.count * this.count; i < il; i++ ) {
      x = i % this.count;
      y = Math.floor( i / this.count );

      ctx.rect( x * cellWidth, y * cellHeight, cellWidth, cellHeight );
    }
  };

  var potentials = [],
      actuals    = [];

  var usingGrid = true,
      drawingGrid = false;

  var grid = new SpatialGrid( 0, 0, canvas.width, canvas.height, 16 );

  function updateGrid() {
    update();

    if ( usingGrid ) {
      grid.clear();
      grid.insertAll( points );

      potentials = grid.retrieve( rect.x, rect.y, rect.width, rect.height )
        .reduce(function( array, points ) {
          return array.concat( points );
        }, [] );
    } else {
      potentials = points;
    }

    actuals = potentials.filter(function( point ) {
      return rect.contains( point.x, point.y );
    });
  }

  function drawGrid( ctx ) {
    draw( ctx );

    // Grid.
    if ( usingGrid && drawingGrid ) {
      ctx.beginPath();
      grid.draw( ctx );
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

    drawRect( ctx );

    // Potentials.
    ctx.font = '12pt monospace';
    ctx.fillStyle = 'yellow';
    ctx.fillText( 'potential: ' + potentials.length, 25, 60 );

    if ( usingGrid ) {
      ctx.beginPath();
      potentials.forEach(function( point ) {
        point.draw( ctx );
      });
      ctx.fill();
    }

    // Actuals.
    ctx.beginPath();
    actuals.forEach(function( point ) {
      point.draw( ctx );
    });

    ctx.fillStyle = '#0f0';
    ctx.fill();

    ctx.fillText( 'actual: ' + actuals.length, 25, 30 );
  }

  function tick() {
    updateGrid();
    drawGrid( context );
    window.requestAnimationFrame( tick );
  }

  document.getElementById( 'toggleGrid' )
    .addEventListener( 'click', function() {
      usingGrid = !usingGrid;
    });

  document.getElementById( 'toggleGridVisibility' )
    .addEventListener( 'click', function() {
      drawingGrid = !drawingGrid;
    });

  init();
  tick();
}) ( window, document );
