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
  function Hilbert2D( options ) {
    this.size  = options.size  || 0;
    this.depth = options.depth || 0;

    this.vertices = [];

    this.dx = [];
    this.dy = [];

    var size = 0.5 * this.size;
    var i, j;
    for ( i = this.depth - 1; i >= 0; i--, size *= 0.5 ) {
      this.dx[i] = [];
      this.dy[i] = [];

      for ( j = 0; j < 4; j++ ) {
        this.dx[i][j] = Hilbert2D.sign.x[j] * size;
        this.dy[i][j] = Hilbert2D.sign.y[j] * size;
      }
    }

    this.generate( 0, 0, this.depth, 0, 1, 2, 3 );
  }

  Hilbert2D.sign = {
    x: [ -1, +1, +1, -1 ],
    y: [ -1, -1, +1, +1 ]
  };

  Hilbert2D.prototype.draw = function( ctx ) {
    if ( !this.vertices.length ) {
      return;
    }

    ctx.moveTo( this.vertices[0][0], this.vertices[0][1] );
    for ( var i = 1, il = this.vertices.length; i < il; i++ ) {
      ctx.lineTo( this.vertices[i][0], this.vertices[i][1] );
    }
  };

  Hilbert2D.prototype.generate = function( x, y, depth, a, b, c, d ) {
    if ( !depth ) {
      this.vertices[ this.vertices.length ] = [ x, y ];
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

  Hilbert2D.prototype.aabb = function() {
    if ( !this.vertices.length ) {
      return;
    }

    var x0 = this.vertices[0][0],
        y0 = this.vertices[0][1],
        x1 = x0,
        y1 = y0;

    var x, y;
    for ( var i = 1, il = this.vertices.length; i < il; i++ ) {
      x = this.vertices[i][0];
      y = this.vertices[i][1];

      if ( x < x0 ) { x0 = x; }
      if ( x > x1 ) { x1 = x; }
      if ( y < y0 ) { y0 = y; }
      if ( y > y1 ) { y1 = y; }
    }

    return {
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1
    };
  };

  var curveWidth = 200;
  var hilbertCurve2d = new Hilbert2D({
    size: curveWidth,
    depth: 5
  });

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    ctx.translate( curveWidth, curveWidth );

    hilbertCurve2d.draw( ctx );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    var aabb = hilbertCurve2d.aabb();
    console.log( '(' +
      aabb.x0 + ', ' +
      aabb.y0 + '), (' +
      aabb.x1 + ', ' +
      aabb.y1 + ')'
    );
  }

  draw( context );


  /**
   * http://www.openprocessing.org/visuals/?visualID=15599
   */
  function Hilbert3D( options ) {
    this.size  = options.size  || 0;
    this.depth = options.depth || 0;

    this.vertices = [];

    this.dx = [];
    this.dy = [];
    this.dz = [];

    var size = 0.5 * this.size;
    var i, j;
    for ( i = this.depth - 1; i >= 0; i--, size *= 0.5 ) {
      this.dx[i] = [];
      this.dy[i] = [];
      this.dz[i] = [];

      for ( j = 0; j < 8; j++ ) {
        this.dx[i][j] = Hilbert2D.sign.x[j] * size;
        this.dy[i][j] = Hilbert2D.sign.y[j] * size;
        this.dz[i][j] = Hilbert2D.sign.z[j] * size;
      }
    }

    this.generate( 0, 0, 0, this.depth, 0, 1, 2, 3, 4,5, 6, 7 );
  }

  Hilbert3D.sign = {
    x: [ -1, -1, -1, -1, +1, +1, +1, +1 ],
    y: [ +1, +1, -1, -1, -1, -1, +1, +1 ],
    z: [ -1, +1, +1, -1, -1, +1, +1, -1 ]
  };

  Hilbert3D.prototype.generate = function( x, y, z, depth, a, b, c, d, e, f, g, h ) {
    if ( !depth ) {
      this.vertices[ this.vertices.length ] = [ x, y, z ];
    } else {
      depth--;

      var dx = this.dx[ depth ],
          dy = this.dy[ depth ],
          dz = this.dz[ depth ];

      this.generate( x + dx[a], y + dy[a], z + dz[a], depth, a, d, e, h, g, f, c, b );
      this.generate( x + dx[b], y + dy[b], z + dz[b], depth, a, h, g, b, c, f, e, d );
      this.generate( x + dx[c], y + dy[c], z + dz[c], depth, a, h, g, b, c, f, e, d );
      this.generate( x + dx[d], y + dy[d], z + dz[d], depth, c, d, a, b, g, h, e, f );
      this.generate( x + dx[e], y + dy[e], z + dz[e], depth, c, d, a, b, g, h, e, f );
      this.generate( x + dx[f], y + dy[f], z + dz[f], depth, e, d, c, f, g, b, a, h );
      this.generate( x + dx[g], y + dy[g], z + dz[g], depth, e, d, c, f, g, b, a, h );
      this.generate( x + dx[h], y + dy[h], z + dz[h], depth, g, f, c, b, a, d, e, h );
    }
  };

}) ( window, document );
