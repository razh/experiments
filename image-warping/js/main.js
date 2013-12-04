/*globals URL*/
(function( window, document, undefined ) {
  'use strict';

  var EPSILON = 1e-6;

  var handlersEl = document.getElementById( 'handlers' );

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var warpCanvas = document.getElementById( 'warp-canvas' ),
      warpCtx    = warpCanvas.getContext( '2d' );

  var gridCanvas = document.getElementById( 'grid-canvas' ),
      gridCtx    = gridCanvas.getContext( '2d' );

  var image = new Image();
  var imageLoaded = false;

  var mouse = {
    x: 0,
    y: 0,

    down: false
  };

  var debug = false;

  var handlers  = [],
      selection = [];

  var xCount = 4,
      yCount = 4;

  var padding = 50,
      // Number of warp grid cells per axis.
      gridCount = 10;

  // Image warping method taken from https://github.com/adobe/cssfilterlab/.
  var factorial = (function() {
    var factorials = [];

    return function( n ) {
      if ( factorials[n] ) {
        return factorials[n];
      }

      var product = 1;
      for ( var i = 2; i <= n; i++ ) {
        product *= i;
      }

      factorials[n] = product;
      return product;
    };
  }) ();

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function binomialCoefficent( n, k ) {
    return factorial( n ) / ( factorial( k ) * factorial( n - k ) );
  }

  function calculateB( k, n, t ) {
    var coefficient = binomialCoefficent( n, k );
    return coefficient * Math.pow( t, k ) * Math.pow( 1 - t, n - k );
  }

  function calculate( u, v, n, m ) {
    var x = 0, y = 0;

    var i, j;
    var coefficient, handler;
    for ( i = 0; i <= n; i++ ) {
      for ( j = 0; j <= m; j++ ) {
        coefficient = calculateB( i, n, u ) * calculateB( j, m, v );
        handler = handlers[ i * xCount + j ];
        x += coefficient * handler.x;
        y += coefficient * handler.y;
      }
    }

    return {
      x: x,
      y: y
    };
  }


  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
    image.onload = function() {
      context.drawImage( image, padding, padding );
      imageLoaded = true;
    };
  });

  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

  function Handler( options ) {
    options = options ? options : {};

    this.x = options.x || 0;
    this.y = options.y || 0;

    this.el = document.createElement( 'div' );
    this.el.id = options.id;
    this.el.classList.add( 'handler' );

    this.offset = { x: 0, y: 0 };

    this.el.addEventListener( 'mousedown', function( event ) {
      if ( selection.indexOf( this ) === -1 ) {
        selection.push( this );
      }

      this.offset.x = event.pageX - this.x;
      this.offset.y = event.pageY - this.y;
    }.bind( this ));

    this.el.addEventListener( 'mouseup', function() {
      var index = selection.indexOf( this );
      if ( index !== -1 ) {
        selection.splice( index, 1 );
      }
    }.bind( this ));
  }

  Handler.prototype.draw = function() {
    var transform = 'translate3d(' +
      this.x + 'px, ' +
      this.y + 'px, 0)';

    this.el.style.transform = this.el.style.webkitTransform = transform;
  };

  function drawWarpGrid( ctx ) {
    ctx.beginPath();

    var gridCellRatio = 1 / gridCount;

    var n = xCount - 1,
        m = yCount - 1;

    // Draw horizontal lines.
    var point;
    var i, j;
    for ( i = 0; i < 1 + EPSILON; i += gridCellRatio ) {
      for ( j = 0; j < 1 + EPSILON; j += gridCellRatio ) {
        point = calculate( i, j, n, m );
        if ( !j ) {
          ctx.moveTo( point.x, point.y );
        } else {
          ctx.lineTo( point.x, point.y );
        }
      }
    }

    // Draw vertical lines.
    for ( j = 0; j < 1 + EPSILON; j += gridCellRatio ) {
      for ( i = 0; i < 1 + EPSILON; i += gridCellRatio ) {
        point = calculate( i, j, n, m );
        if ( !i ) {
          ctx.moveTo( point.x, point.y );
        } else {
          ctx.lineTo( point.x, point.y );
        }
      }
    }

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }

  function getWarpGridQuads() {
    var quads = [];

    var gridCellRatio = 1 / gridCount;

    var n = xCount - 1,
        m = yCount - 1;

    var point;
    var quad;
    var i, j;
    // Unlike the drawWarpGrid(), we don't want vertices in the last row/column.
    for ( i = 0; i < 1 - EPSILON; i += gridCellRatio ) {
      for ( j = 0; j < 1 - EPSILON; j += gridCellRatio ) {
        quad = [];

        // Top left.
        point = calculate( i, j, n, m );
        quad.push({
          x: point.x,
          y: point.y,
          u: j,
          v: i
        });

        // Bottom left.
        point = calculate( i, j + gridCellRatio, n, m );
        quad.push({
          x: point.x,
          y: point.y,
          u: j + gridCellRatio,
          v: i
        });

        // Bottom right.
        point = calculate( i + gridCellRatio, j + gridCellRatio, n, m );
        quad.push({
          x: point.x,
          y: point.y,
          u: j + gridCellRatio,
          v: i + gridCellRatio
        });

        // Top right.
        point = calculate( i + gridCellRatio, j, n, m );
        quad.push({
          x: point.x,
          y: point.y,
          u: j,
          v: i + gridCellRatio
        });

        quads.push( quad );
      }
    }

    return quads;
  }

  function drawGridLines( ctx ) {
    var x0, y0;
    var index;
    var i, j;

    ctx.beginPath();

    for ( i = 0; i < yCount; i++ ) {
      for ( j = 0; j < xCount; j++ ) {
        index = i * xCount + j;

        x0 = handlers[ index ].x;
        y0 = handlers[ index ].y;

        // Draw columns.
        if ( i ) {
          ctx.moveTo( x0, y0 );
          ctx.lineTo( handlers[ index - xCount ].x, handlers[ index - xCount ].y );
        }

        // Draw rows.
        if ( j ) {
          ctx.moveTo( x0, y0 );
          ctx.lineTo( handlers[ index - 1 ].x, handlers[ index - 1 ].y );
        }
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }


  /**
   * Return the vertices of each quad as determined by the handler grid.
   */
  function getQuads( handlers ) {
    var quads = [];

    var quad;
    var index;
    var i, j;
    for ( i = 0; i < yCount - 1; i++ ) {
      for ( j = 0; j < xCount - 1; j++ ) {
        index = i * xCount + j;

        quad = [];

        // Top left.
        quad.push({
          x: handlers[ index ].x,
          y: handlers[ index ].y,
          u: j / xCount,
          v: i / yCount
        });

        // Bottom left.
        quad.push({
          x: handlers[ index + xCount ].x,
          y: handlers[ index + xCount ].y,
          u: j / xCount,
          v: ( i + 1 ) / yCount
        });

        // Bottom right.
        quad.push({
          x: handlers[ index + xCount + 1 ].x,
          y: handlers[ index + xCount + 1 ].y,
          u: ( j + 1 ) / xCount,
          v: ( i + 1 ) / yCount
        });

        // Top right.
        quad.push({
          x: handlers[ index + 1 ].x,
          y: handlers[ index + 1 ].y,
          u: ( j + 1 ) / xCount,
          v: i / yCount
        });

        quads.push( quad );
      }
    }

    return quads;
  }

  function drawPolygonPath( ctx, vertices ) {
    ctx.beginPath();

    ctx.moveTo( vertices[0].x, vertices[0].y );
    for ( var i = 1, il = vertices.length; i < il; i++ ) {
      ctx.lineTo( vertices[i].x, vertices[i].y );
    }

    ctx.closePath();
  }

  function drawMovingCircle( ctx ) {
    ctx.beginPath();

    ctx.arc( mouse.x, mouse.y, 20, 0, 2 * Math.PI  );

    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.rect( mouse.x - 30, mouse.y - 30, 60, 60 );

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }

  function draw() {
    handlers.forEach(function( handler ) {
      handler.draw();
    });

    context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
    drawMovingCircle( context );

    warpCtx.clearRect( 0, 0, warpCtx.canvas.width, warpCtx.canvas.height );
    drawWarpGrid( warpCtx );


    gridCtx.clearRect( 0, 0, gridCtx.canvas.width, gridCtx.canvas.height );
    drawGridLines( gridCtx );

    // Draw warp grid test quad.
    var warpQuads = getWarpGridQuads( handlers );
    var warpQuad = warpQuads[ warpQuads.length - 1 ];

    if ( debug ) {
      drawPolygonPath( warpCtx, warpQuad );
      warpCtx.fillStyle = 'rgba(255, 0, 255, 0.3)';
      warpCtx.fill();
    }

    // Draw test quad.
    var quads = getQuads( handlers );
    var quad = quads[0];

    if ( debug ) {
      drawPolygonPath( gridCtx, quad );
      gridCtx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      gridCtx.fill();
    }

    if ( imageLoaded ) {
      warpQuads.forEach(function( warpQuad ) {
        if ( debug ) {
          drawPolygonPath( warpCtx, warpQuad );
          warpCtx.fillStyle = 'rgb(' +
            Math.round( warpQuad[0].u * 255 ) + ', ' +
            Math.round( warpQuad[0].v * 255 ) + ', ' +
            Math.round( warpQuad[1].u * 255 ) +
          ')';
          warpCtx.fill();
        }

        textureMap( warpCtx, image, warpQuad );
      });
    } else {
      warpQuads.forEach(function( warpQuad, index ) {
        textureMap( warpCtx, context.canvas, warpQuad, index !== -1 );
      });
    }
  }

  // http://stackoverflow.com/questions/4774172/image-manipulation-and-texture-mapping-using-html5-canvas
  function textureMap( ctx, texture, pts, drawDebug ) {
    var xmin = pts[0].u * texture.width,
        ymin = pts[0].v * texture.height,
        xmax = pts[2].u * texture.width,
        ymax = pts[2].v * texture.width;

    var tris = [ [ 0, 1, 2 ], [ 2, 3, 0 ] ]; // Split in two triangles
    for ( var t = 0; t < 2; t++ ) {
      var pp = tris[t];
      var x0 = pts[ pp[0] ].x, x1 = pts[ pp[1] ].x, x2 = pts[ pp[2] ].x;
      var y0 = pts[ pp[0] ].y, y1 = pts[ pp[1] ].y, y2 = pts[ pp[2] ].y;
      var u0 = pts[ pp[0] ].u, u1 = pts[ pp[1] ].u, u2 = pts[ pp[2] ].u;
      var v0 = pts[ pp[0] ].v, v1 = pts[ pp[1] ].v, v2 = pts[ pp[2] ].v;

      u0 *= texture.width;
      u1 *= texture.width;
      u2 *= texture.width;

      v0 *= texture.height;
      v1 *= texture.height;
      v2 *= texture.height;

      // Set clipping area so that only pixels inside the triangle will
      // be affected by the image drawing operation
      ctx.save();

      ctx.beginPath();
      ctx.moveTo( x0, y0 );
      ctx.lineTo( x1, y1 );
      ctx.lineTo( x2, y2 );
      ctx.closePath();

      // ctx.clip();

      // Compute matrix transform
      var delta  = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
      var deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
      var deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
      var deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
      var deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
      var deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
      var deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;

      // Draw the transformed image
      ctx.transform(
        deltaA / delta, deltaD / delta,
        deltaB / delta, deltaE / delta,
        deltaC / delta, deltaF / delta
      );

      // ctx.drawImage( texture, 0, 0 );
      ctx.drawImage(
        texture,
        xmin, ymin, xmax - xmin, ymax - ymin,
        xmin, ymin, xmax - xmin, ymax - ymin
       );

      if ( drawDebug ) {
        // // Draw entire texture.
        // ctx.beginPath();
        // ctx.rect( 0, 0, texture.width, texture.height );
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = '#f00';
        // ctx.stroke();

        var a = deltaA / delta,
            b = deltaB / delta,
            c = deltaC / delta,
            d = deltaD / delta,
            e = deltaE / delta,
            f = deltaF / delta;

        // Determine the inverse of the current transform matrix.
        var det = a * e - b * d;

        var at = e,
            bt = -d,
            ct = 0,
            dt = -b,
            et = a,
            ft = 0,
            gt = b * f - c * e,
            ht = -( a * f - c * d ),
            it =  a * e - b * d; // Same as determinant.

        if ( !det ) {
          console.log( 'Determinant is zero.' );
        }

        a = at / det;
        b = bt / det;
        c = dt / det;
        d = et / det;
        e = gt / det;
        f = ht / det;

        var txmin = a * xmin + c * ymin + e,
            tymin = b * xmin + d * ymin + f;

        var txmax = a * xmax + c * ymax + e,
            tymax = b * xmax + d * ymax + f;

        // ctx.beginPath();

        // // Projected image grid.
        // // ctx.rect( xmin, ymin, xmax - xmin, ymax - ymin );

        // // Original image grid (transformed).
        // ctx.rect( txmin, tymin, txmax - txmin, tymax - tymin );

        // ctx.lineWidth = 2;
        // ctx.strokeStyle = '#0f0';
        // ctx.stroke();
      }

      ctx.restore();

    }

    // Original image grid.
    ctx.beginPath();
    ctx.rect( xmin, ymin, xmax - xmin, ymax - ymin );
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f0';
    ctx.stroke();
  }

  document.addEventListener( 'mousedown', function( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    mouse.down = true;
  });

  document.addEventListener( 'mousemove', function( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    selection.forEach(function( object ) {
      object.x = mouse.x + object.offset.x;
      object.y = mouse.y + object.offset.y;
    });

    draw();
  });

  document.addEventListener( 'mouseup', function() {
    mouse.down = false;
  });

  function resize() {
    canvas.width  = handlersEl.clientWidth;
    canvas.height = handlersEl.clientHeight;

    warpCanvas.width  = handlersEl.clientWidth;
    warpCanvas.height = handlersEl.clientHeight;

    gridCanvas.width  = handlersEl.clientWidth;
    gridCanvas.height = handlersEl.clientHeight;

    var width  = handlersEl.clientWidth  - 2 * padding,
        height = handlersEl.clientHeight - 2 * padding;

    var colWidth  = width  / ( xCount - 1 ),
        rowHeight = height / ( yCount - 1 );

    var handler;
    var index;
    var i, j;
    for ( i = 0; i < yCount; i++ ) {
      for ( j = 0; j < xCount; j++ ) {
        index = i * xCount + j;
        handler = handlers[ index ];
        handler.x = j * colWidth + padding;
        handler.y = i * rowHeight + padding;
      }
    }

    draw();
  }

  function init() {
    // Create grid of handlers.
    var handler;
    var i, j;
    for ( i = 0; i < yCount; i++ ) {
      for ( j = 0; j < xCount; j++ ) {
        handler = new Handler({
          id: i * xCount + j
        });

        handlers.push( handler );
        handlersEl.appendChild( handler.el );
      }
    }

    resize();
  }

  window.addEventListener( 'resize', resize );

  init();
}) ( window, document );
