/*globals
canvas, context,
points,
running,
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

  /**
   * Draws the cells intersecting the given bounding box.
   */
  SpatialGrid.prototype.drawIntersection = function( ctx, x, y, width, height ) {
    var xminIndex = this.xIndexOf( x ),
        yminIndex = this.yIndexOf( y ),
        xmaxIndex = this.xIndexOf( x + width ),
        ymaxIndex = this.yIndexOf( y + height );

    var xmin = xminIndex * this.cellWidth,
        ymin = yminIndex * this.cellHeight,
        xmax = ( xmaxIndex + 1 ) * this.cellWidth,
        ymax = ( ymaxIndex + 1 ) * this.cellHeight;

    ctx.rect( xmin, ymin, xmax - xmin, ymax - ymin );
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

      // Intersection.
      ctx.beginPath();
      grid.drawIntersection( ctx, rect.x, rect.y, rect.width, rect.height );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();
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
    if ( !running ) {
      return;
    }

    updateGrid();
    drawGrid( context );
    window.requestAnimationFrame( tick );
  }

  document.addEventListener( 'keydown', function( event ) {
    // Space.
    if ( event.which === 32 ) {
      if ( running ) {
        tick();
      }
    }
  });

  document.getElementById( 'toggleGrid' )
    .addEventListener( 'click', function() {
      usingGrid = !usingGrid;
    });

  document.getElementById( 'toggleGridVisibility' )
    .addEventListener( 'click', function() {
      drawingGrid = !drawingGrid;
    });

  (function() {
    init();
    updateGrid();
    drawGrid( context );
  }) ();
}) ( window, document );
