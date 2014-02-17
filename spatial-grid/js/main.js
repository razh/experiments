/*globals SpatialGrid*/
(function( window, document, undefined ) {
  'use strict';

  SpatialGrid.prototype.draw = function( ctx ) {
    var cellWidth  = this.spacing.x,
        cellHeight = this.spacing.y;

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

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.beginPath();

    grid.draw( ctx );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.stroke();
  }

  window.addEventListener( 'mousemove', function( event ) {
    var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;

    var xIndex = grid.xIndexOf( x ),
        yIndex = grid.yIndexOf( y );

    draw( context );

    context.beginPath();
    context.rect( xIndex * grid.spacing.x, yIndex * grid.spacing.y, grid.spacing.x, grid.spacing.y );
    context.fillStyle = 'rgba(0, 255, 0, 0.25)';
    context.fill();
  });

}) ( window, document );
