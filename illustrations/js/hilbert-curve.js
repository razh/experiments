(function( window, document, undefined ) {
  'use strict';

  var curveWidth = 200;

  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = canvas.parentNode.clientWidth;
  canvas.height = canvas.parentNode.clientHeight;

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

  Hilbert3D.prototype.draw = function( ctx, matrix ) {
    ctx.beginPath();

    var vertex = mulMat4Vec3( matrix, this.vertices[0] );
    ctx.moveTo( vertex[0], vertex[1] );

    for ( var i = 0, il = this.vertices.length; i < il; i++ ) {
      vertex = mulMat4Vec3( matrix, this.vertices[i] );
      ctx.lineTo( vertex[0], vertex[1] );
    }
  };

  Hilbert3D.prototype.aabb = function() {
    if ( !this.vertices.length ) {
      return;
    }

    var x0 = this.vertices[0][0],
        y0 = this.vertices[0][1],
        z0 = this.vertices[0][2],
        x1 = x0,
        y1 = y0,
        z1 = z0;

    var x, y, z;
    for ( var i = 1, il = this.vertices.length; i < il; i++ ) {
      x = this.vertices[i][0];
      y = this.vertices[i][1];
      z = this.vertices[i][2];

      if ( x < x0 ) { x0 = x; }
      if ( x > x1 ) { x1 = x; }
      if ( y < y0 ) { y0 = y; }
      if ( y > y1 ) { y1 = y; }
      if ( z < z0 ) { z0 = z; }
      if ( z > z1 ) { z1 = z; }
    }

    return {
      x0: x0,
      y0: y0,
      z0: z0,
      x1: x1,
      y1: y1,
      z1: z1
    };
  };


  /**
   * Matrix functions.
   *
   * CSS matrices are represented in column-major order.
   */
  var identityMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  function mulMat4Vec3( mat4, vec3 ) {
    var x = vec3[0],
        y = vec3[1],
        z = vec3[2];

    return [
      mat4[0] * x + mat4[4] * y + mat4[8]  * z + mat4[12],
      mat4[1] * x + mat4[5] * y + mat4[9]  * z + mat4[13],
      mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]
    ];
  }

  function mulMat4Mat4( a, b ) {
    return [
      a[0] * b[ 0] + a[4] * b[ 1] + a[ 8] * b[ 2] + a[12] * b[ 3],
      a[1] * b[ 0] + a[5] * b[ 1] + a[ 9] * b[ 2] + a[13] * b[ 3],
      a[2] * b[ 0] + a[6] * b[ 1] + a[10] * b[ 2] + a[14] * b[ 3],
      a[3] * b[ 0] + a[7] * b[ 1] + a[11] * b[ 2] + a[15] * b[ 3],

      a[0] * b[ 4] + a[4] * b[ 5] + a[ 8] * b[ 6] + a[12] * b[ 7],
      a[1] * b[ 4] + a[5] * b[ 5] + a[ 9] * b[ 6] + a[13] * b[ 7],
      a[2] * b[ 4] + a[6] * b[ 5] + a[10] * b[ 6] + a[14] * b[ 7],
      a[3] * b[ 4] + a[7] * b[ 5] + a[11] * b[ 6] + a[15] * b[ 7],

      a[0] * b[ 8] + a[4] * b[ 9] + a[ 8] * b[10] + a[12] * b[11],
      a[1] * b[ 8] + a[5] * b[ 9] + a[ 9] * b[10] + a[13] * b[11],
      a[2] * b[ 8] + a[6] * b[ 9] + a[10] * b[10] + a[14] * b[11],
      a[3] * b[ 8] + a[7] * b[ 9] + a[11] * b[10] + a[15] * b[11],

      a[0] * b[12] + a[4] * b[13] + a[ 8] * b[14] + a[12] * b[15],
      a[1] * b[12] + a[5] * b[13] + a[ 9] * b[14] + a[13] * b[15],
      a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
      a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
    ];
  }

  function matrixToMatrix3D( matrix ) {
    return [
      matrix[0], matrix[1], 0, 0,
      matrix[2], matrix[3], 0, 0,
      0, 0, 1, 0,
      matrix[4], matrix[5], 0, 1
    ];
  }

  function calculatePerspectiveMatrix( perspective ) {
    var matrix = identityMatrix.slice();

    if ( perspective > 0 ) {
      matrix[ 11 ] = -1 / perspective;
    }

    return matrix;
  }

  // 3D utility functions.
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
    var divs = document.createDocumentFragment();

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
        transform += ' rotateZ(180deg)';
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
    size: curveWidth,
    depth: 2
  });

  // Print AABB.
  (function() {
    var aabb = h3d.aabb();
    console.log( '(' +
      aabb.x0 + ', ' +
      aabb.y0 + ', ' +
      aabb.z0 + '), (' +
      aabb.x1 + ', ' +
      aabb.y1 + ', ' +
      aabb.z1 + ')'
    );
  }) ();

  // Create segment elements.
  var h3dDivs = segmentsToDivs( pointsToSegments( h3d.vertices ) );

  var h3dContainer = document.querySelector( '.hilbert3d-container' );
  var h3dDiv = document.getElementById( 'hilbert3d' );

  h3dDiv.appendChild( h3dDivs );

  var h3dTransform = {
    translateX: h3d.size,
    translateY: h3d.size,

    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,

    perspective: 1000
  };

  var h3dMatrix = identityMatrix.slice();

  function setTransform( el, options ) {
    options = options ? options : {};

    var translateX = options.translateX || 0,
        translateY = options.translateY || 0,

        rotateX = options.rotateX || 0,
        rotateY = options.rotateY || 0,
        rotateZ = options.rotateZ || 0;

    el.style.webkitTransform = el.style.transform = 'translate(' +
      translateX + 'px, ' +
      translateY + 'px) rotateX(' +
      rotateX + 'deg) rotateY(' +
      rotateY + 'deg) rotateZ(' +
      rotateZ + 'deg)';
  }

  function setPerspective( el, options ) {
    options = options ? options : {};

    var perspective = options.perspective || 0;
    el.style.webkitPerspective = el.style.perspective = perspective + 'px';
  }

  setTransform( h3dDiv, h3dTransform );
  setPerspective( h3dContainer, h3dTransform );

  var h3dTransformOrigin = '0 0 0';
  h3dDiv.style.webkitTransformOrigin = h3dTransformOrigin;
  h3dDiv.style.transformOrigin = h3dTransformOrigin;

  var h3dTransformStyle = 'preserve-3d';
  h3dDiv.style.webkitTransformStyle = h3dTransformStyle;
  h3dDiv.style.transformStyle = h3dTransformStyle;

  var h3dPerspectiveOrigin = h3d.size + 'px ' + h3d.size + 'px';
  h3dContainer.style.webkitPerspectiveOrigin = h3dPerspectiveOrigin;
  h3dContainer.style.perspectiveOrigin = h3dPerspectiveOrigin;


  // Hilbert3D canvas.
  var h3dCanvas = document.getElementById( 'canvas-3d' ),
      h3dCtx    = h3dCanvas.getContext( '2d' );

  h3dCanvas.width  = h3dCanvas.parentNode.clientWidth;
  h3dCanvas.height = h3dCanvas.parentNode.clientHeight;

  function draw3d( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // h3d.draw( ctx, mulMat4Mat4( h3dMatrix, calculatePerspectiveMatrix( h3dTransform.perspective ) ) );
    h3d.draw( ctx, h3dMatrix );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  draw3d( h3dCtx );


  // Input handlers.
  (function() {
    var mat2dRegex = /^matrix\(.*/,
        mat3dRegex = /^matrix3d\(.*/;

    var mat3dPrefixLen = 'matrix3d('.length,
        mat2dPrefixLen = 'matrix('.length,
        matSuffixLen   = ')'.length;

    function extractMatrix( str ) {
      var prefixLen;
      if ( str.match( mat3dRegex ) ) {
        prefixLen = mat3dPrefixLen;
      } else if ( str.match( mat2dRegex ) ) {
        prefixLen = mat2dPrefixLen;
      } else {
        return null;
      }

      return str.substring( prefixLen, str.length - matSuffixLen )
        .split( ', ' )
        .map( parseFloat );
    }

    var formGroups = [].slice.call( document.getElementsByClassName( 'form-group' ) );
    formGroups.forEach(function( formGroup ) {
      var value = formGroup.getElementsByClassName( 'value' )[0],
          input = formGroup.getElementsByTagName( 'input' )[0],
          units = input.getAttribute( 'units' );

      // Set initial values.
      input.value = h3dTransform[ input.id ];

      function update() {
        h3dTransform[ input.id ] = parseInt( input.value, 10 );
        setTransform( h3dDiv, h3dTransform );
        setPerspective( h3dContainer, h3dTransform );

        value.innerHTML = h3dTransform[ input.id ] + units;

        // Grab the computed transform matrix and draw the canvas Hilbert3D.
        var computedStyle = window.getComputedStyle( h3dDiv ),
            transformString = computedStyle.webkitTransform || computedStyle.transform;

        var matrix = extractMatrix( transformString );
        if ( matrix && matrix.length ) {
          // In matrix(a, b, c, d, tx, ty) shorthand form.
          if ( matrix.length === 6 ) {
            matrix = matrixToMatrix3D( matrix );
          }

          if ( matrix.length !== 16 ) {
            return;
          }

          h3dMatrix = matrix;
        }

        draw3d( h3dCtx );
      }

      input.addEventListener( 'input', update );
      update();
    });
  }) ();

  // Button handlers.
  (function() {
    var resetBtn = document.getElementById( 'reset-btn' );

    resetBtn.addEventListener( 'click', function( event ) {
      event.preventDefault();

      h3dTransform.translateX = h3d.size;
      h3dTransform.translateY = h3d.size;

      h3dTransform.rotateX = 0;
      h3dTransform.rotateY = 0;
      h3dTransform.rotateZ = 0;

      h3dTransform.perspective = 1000;

      setTransform( h3dDiv, h3dTransform );
      setPerspective( h3dContainer, h3dTransform );

      var changeEvent = new CustomEvent( 'change' );

      // Hacky way of updating displayed values by triggering a change event.
      var formGroups = [].slice.call( document.getElementsByClassName( 'form-group' ) );
      formGroups.forEach(function( formGroup ) {
        var input = formGroup.getElementsByTagName( 'input' )[0];
        input.value = h3dTransform[ input.id ];

        input.dispatchEvent( changeEvent );
      });
    });
  }) ();
}) ( window, document );
