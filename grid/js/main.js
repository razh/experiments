(function( window, document, undefined ) {
  'use strict';

  var mat4 = {
    identity: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ],

    mulVec: function( mat, vec ) {
      var x = vec[0],
          y = vec[1],
          z = vec[2];

      return [
        mat[0] * x + mat[4] * y + mat[8]  * z + mat[12],
        mat[1] * x + mat[5] * y + mat[9]  * z + mat[13],
        mat[2] * x + mat[6] * y + mat[10] * z + mat[14]
      ];
    }
  };

  function Grid2D( options ) {
    options = options ? options : {};

    this.x = options.x || 0;
    this.y = options.y || 0;
    this.z = options.z || 0;

    this.width  = typeof options.width  !== 'undefined' ? options.width  : 1;
    this.height = typeof options.height !== 'undefined' ? options.height : 1;

    this.cols = typeof options.cols !== 'undefined' ? options.cols : 1;
    this.rows = typeof options.rows !== 'undefined' ? options.rows : 1;

    this.vertices = [];

    this.generate();
  }

  Grid2D.prototype.generate = function() {
    var x = this.x,
        y = this.y,
        z = this.z;

    var colWidth  = this.width  / this.cols,
        rowHeight = this.height / this.rows;

    var i, j;
    for ( j = 0; j < this.rows; j++ ) {
      for ( i = 0; i < this.cols; i++ ) {
        this.vertices.push([
          x + colWidth  * i,
          y + rowHeight * j,
          z
        ]);
      }
    }
  };

  Grid2D.prototype.draw = function( ctx, matrix ) {
    if ( !this.vertices.length ) {
      return;
    }

    var point = mat4.mulVec( matrix, this.vertices[0] );
    ctx.rect( point[0] - 1, point[1] - 1, 2, 2 );

    for ( var i = 1, il = this.vertices.length; i < il; i++ ) {
      point = mat4.mulVec( matrix, this.vertices[i] );
      // ctx.lineTo( point[0], point[1] );
      ctx.rect( point[0] - 1, point[1] - 1, 2, 2 );
    }
  };

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var grid = new Grid2D({
    width: 200,
    height: 200,
    rows: 10,
    cols: 10
  });

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.save();
    ctx.translate( 100, 100 );

    grid.draw( ctx, mat4.identity );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.restore();
  }

  draw( context );

}) ( window, document );
