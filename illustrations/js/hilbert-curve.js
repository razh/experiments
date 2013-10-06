(function( window, document, undefined ) {
  'use strict';

  var curveWidth = 200;

  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 2.5 * curveWidth;
  canvas.height = 2.5 * curveWidth;

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

  var h2d = new Hilbert2D({
    size: curveWidth,
    depth: 5
  });

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    ctx.translate( curveWidth, curveWidth );

    h2d.draw( ctx );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    var aabb = h2d.aabb();
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
        this.dx[i][j] = Hilbert3D.sign.x[j] * size;
        this.dy[i][j] = Hilbert3D.sign.y[j] * size;
        this.dz[i][j] = Hilbert3D.sign.z[j] * size;
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


  function distanceSquared3D( x0, y0, z0, x1, y1, z1 ) {
    var dx = x1 - x0,
        dy = y1 - y0,
        dz = z1 - z0;

    return dx * dx + dy * dy + dz * dz;
  }

  function distance3D( x0, y0, z0, x1, y1, z1 ) {
    return Math.sqrt( distanceSquared3D( x0, y0, z0, x1, y1, z1 ) );
  }

  var Axis = {
    X: 1,
    Y: 2,
    Z: 4
  };

  function axisOf( x0, y0, z0, x1, y1, z1 ) {
    if ( x1 - x0 ) {
      return Axis.X;
    } else if ( y1 - y0 ) {
      return Axis.Y;
    } else if ( z1 - z0 ) {
      return Axis.Z;
    }

    return null;
  }

  function pointsToSegments( points ) {
    var segments = [];

    for ( var i = 0, il = points.length - 1; i < il; i++ ) {
      // Copy by value.
      segments.push([
        [
          points[i][0],
          points[i][1],
          points[i][2]
        ],
        [
          points[ i + 1 ][0],
          points[ i + 1 ][1],
          points[ i + 1 ][2]
        ]
      ]);
    }

    return segments;
  }

  function segmentsToDivs( segments ) {
    var divs = document.createElement( 'div' );

    var div;
    var dx, dy, dz;
    var x0, y0, z0, x1, y1, z1;
    var segment, distance, axis, transform, transformOrigin;
    for ( var i = 0, il = segments.length; i < il; i++ ) {
      div = document.createElement( 'div' );
      div.classList.add( 'segment' );

      segment = segments[i];

      x0 = segment[0][0];
      y0 = segment[0][1];
      z0 = segment[0][2];

      x1 = segment[1][0];
      y1 = segment[1][1];
      z1 = segment[1][2];

      dx = x1 - x0;
      dy = y1 - y0;
      dz = z1 - z0;

      distance = distance3D( x0, y0, z0, x1, y1, z1 );
      axis = axisOf( x0, y0, z0, x1, y1, z1 );

      div.style.width = distance + 'px';
      div.style.position = 'absolute';

      transform = 'translate3d(' +
        x0 + 'px, ' +
        y0 + 'px, ' +
        z0 + 'px)';

      if ( axis === Axis.X && dx < 0 ) {
        transform += 'rotateZ(180deg)';
      }

      if ( axis === Axis.Y ) {
        if ( dy > 0 ) {
          transform += ' rotateZ(90deg)';
        } else {
          transform += ' rotateZ(-90deg)';
        }
      }

      if ( axis === Axis.Z ) {
        if ( dz > 0 ) {
          transform += ' rotateY(-90deg)';
        } else {
          transform += ' rotateY(90deg)';
        }
      }

      div.style.webkitTransform = transform;
      div.style.transform = transform;

      transformOrigin = '0 50% 0';
      div.style.webkitTransformOrigin = transformOrigin;
      div.style.transformOrigin = transformOrigin;

      divs.appendChild( div );
    }

    return divs;
  }

  var h3d = new Hilbert3D({
    size: 200,
    depth: 2
  });

  var h3dDivs = segmentsToDivs([
    [
      [ 100, 100, 100 ],
      [ 200, 100, 100 ]
    ]
  ]);

  h3dDivs = segmentsToDivs( pointsToSegments( h3d.vertices ) );

  var h3dDiv = document.getElementById( 'hilbert3d' );
  h3dDiv.appendChild( h3dDivs );

  var h3dTransform = 'translate(200px, 200px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
  h3dDivs.style.webkitTransform = h3dTransform;
  h3dDivs.style.transform = h3dTransform;

  var h3dTransformStyle = 'preserve-3d';
  h3dDivs.style.webkitTransformStyle = h3dTransformStyle;
  h3dDivs.style.transformStyle = h3dTransformStyle;

  var h3dPerspective = 1000;
  h3dDivs.style.webkitPerspective = h3dPerspective;
  h3dDivs.style.perspective = h3dPerspective;

  var h3dPerspectiveOrigin = 'left top';
  h3dDivs.style.webkitPerspectiveOrigin = h3dPerspectiveOrigin;
  h3dDivs.style.perspectiveOrigin = h3dPerspectiveOrigin;

  // Handlers.
  var inputs = [].slice.call( document.getElementsByTagName( 'input' ) );
  inputs.forEach(function( input ) {
    console.log(input.value);
  });
}) ( window, document );
