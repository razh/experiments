/*globals
canvas, context,
points,
running,
update, draw, init,
rect, drawRect,
Quadtree*/
(function( window, document, undefined ) {
  'use strict';

  Quadtree.prototype.draw = function( ctx ) {
    ctx.rect( this.x, this.y, this.size, this.size );

    this.children.forEach(function( child ) {
      child.draw( ctx );
    });
  };

  Quadtree.prototype.count = function() {
    return this.children.reduce(function( sum, child ) {
      return sum + child.count();
    }, 1 );
  };

  var potentials = [],
      actuals    = [];

  var usingQuadtree = true;
  var drawingQuadtree = false;

  var quadtree = new Quadtree( 0, 0, Math.max( canvas.width, canvas.height ) );

  function updateQuadtree() {
    update();

    if ( usingQuadtree ) {
      quadtree.clear();
      quadtree.insertAll( points );

      potentials = quadtree.retrieve( rect.x, rect.y, rect.width, rect.height );
    } else {
      potentials = points;
    }

    actuals = potentials.filter(function( point ) {
      return rect.contains( point.x, point.y );
    });
  }

  function drawQuadtree( ctx ) {
    draw( ctx );

    // Quadtree.
    if ( usingQuadtree && drawingQuadtree ) {
      ctx.beginPath();
      quadtree.draw( ctx );
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

    drawRect( ctx );

    // Potentials.
    ctx.font = '12pt monospace';
    ctx.fillStyle = 'yellow';
    ctx.fillText( 'potential: ' + potentials.length, 25, 60 );

    if ( usingQuadtree ) {
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

    // Quadtree nodes,
    if ( usingQuadtree ) {
      ctx.fillStyle = '#fff';
      ctx.fillText( 'quadtree nodes: ' + quadtree.count(), 25, 90 );
    }
  }

  function tick() {
    if ( !running ) {
      return;
    }

    updateQuadtree();
    drawQuadtree( context );
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

  document.getElementById( 'toggleQuadtree' )
    .addEventListener( 'click', function() {
      usingQuadtree = !usingQuadtree;
    });

  document.getElementById( 'toggleQuadtreeVisibility' )
    .addEventListener( 'click', function() {
      drawingQuadtree = !drawingQuadtree;
    });

  (function() {
    init();
    updateQuadtree();
    drawQuadtree( context );
  }) ();
}) ( window, document );
