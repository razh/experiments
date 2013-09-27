(function( window, document, undefined ) {
  'use strict';

  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  /**
   * Thomas Diewald's Hilbert curve algorithm.
   * http://www.openprocessing.org/sketch/15493
   */
  var signX = [ -1, +1, +1, -1 ],
      signY = [ -1, -1, +1, +1 ];

  function Hilbert2D( size, depth ) {
    this.size  = size  = size  || 0;
    this.depth = depth = depth || 0;

    this.vertices = [];

    this.dx = [];
    this.dy = [];

    size *= 0.5;

    var i, j;
    for ( i = depth - 1; i >= 0; i--, size *= 0.5 ) {
      this.dx[i] = [];
      this.dy[i] = [];

      for ( j = 0; j < 4; j++ ) {
        this.dx[i][j] = signX[j] * size;
        this.dy[i][j] = signY[j] * size;
      }
    }

    this._index = 0;
    this.generate( 0, 0, depth, 0, 1, 2, 3 );
    delete this._index;
  }

  Hilbert2D.prototype.draw = function( ctx ) {
    if ( !this.vertices.length ) {
      return;
    }

    var xmin = this.vertices[0][0],
        ymin = this.vertices[0][1],
        xmax = xmin,
        ymax = ymin;

    ctx.moveTo( this.vertices[0][0], this.vertices[0][1] );
    var i, il;
    for ( i = 1, il = this.vertices.length; i < il; i++ ) {
      ctx.lineTo( this.vertices[i][0], this.vertices[i][1] );

      var x = this.vertices[i][0],
          y = this.vertices[i][1];

      if ( x < xmin ) { xmin = x; }
      if ( x > xmax ) { xmax = x; }
      if ( y < ymin ) { ymin = y; }
      if ( y > ymax ) { ymax = y; }
    }

    console.log( '(' + xmin + ', ' + ymin + '), (' + xmax + ', ' +  ymax + ')' );
  };

  Hilbert2D.prototype.generate = function( x, y, depth, a, b, c, d ) {
    if ( !depth ) {
      this.vertices[ this._index ] = [ x, y ];
      this._index++;
    } else {
      depth--;

      var dx = this.dx[ depth ],
          dy = this.dy[ depth ];

      this.generate( x + dx[a], y + dy[a], depth, a, d, c, b );
      this.generate( x + dx[b], y + dy[b], depth, a, b, c, d );
      this.generate( x + dx[c], y + dy[c], depth, a, b, c, d );
      this.generate( x + dx[d], y + dy[d], depth, c, b, a, d );
    }
  };

  var curveWidth = 200;
  var hilbertCurve2d = new Hilbert2D( curveWidth, 5 );

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    ctx.translate( curveWidth, curveWidth );

    hilbertCurve2d.draw( ctx );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  draw( context );

}) ( window, document );
