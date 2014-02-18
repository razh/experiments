/*globals SpatialGrid*/
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

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var grid = new SpatialGrid( 0, 0, canvas.width, canvas.height, 16 );

  var mouse = {
    x: 0,
    y: 0
  };

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();

    grid.draw( ctx );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // Highlight cell of current mouse position.
    ctx.beginPath();

    var xIndex = grid.xIndexOf( mouse.x ),
        yIndex = grid.yIndexOf( mouse.y );

    ctx.rect(
      xIndex * grid.cellWidth, yIndex * grid.cellHeight,
      grid.cellWidth, grid.cellHeight
    );

    ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
    ctx.fill();
  }

  window.addEventListener( 'mousemove', function( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;

    draw( context );
  });

}) ( window, document );
