/*globals URL*/
(function( window, document, undefined ) {
  'use strict';

  var handlersEl = document.getElementById( 'handlers' );

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = handlersEl.clientWidth;
  canvas.height = handlersEl.clientHeight;

  var warpCanvas = document.getElementById( 'warp-canvas' ),
      warpCtx    = warpCanvas.getContext( '2d' );

  warpCanvas.width  = handlersEl.clientWidth;
  warpCanvas.height = handlersEl.clientHeight;

  var gridCanvas = document.getElementById( 'grid-canvas' ),
      gridCtx    = gridCanvas.getContext( '2d' );

  gridCanvas.width  = handlersEl.clientWidth;
  gridCanvas.height = handlersEl.clientHeight;

  var image = new Image();

  var mouse = {
    x: 0,
    y: 0,

    down: false
  };

  var handlers  = [],
      selection = [];

  var xCount = 4,
      yCount = 4;

  var padding = 50,
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
      selection.push( this );

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
    for ( i = 0; i <= 1; i += gridCellRatio ) {
      for ( j = 0; j <= 1; j += gridCellRatio ) {
        point = calculate( i, j, n, m );
        if ( !j ) {
          ctx.moveTo( point.x, point.y );
        } else {
          ctx.lineTo( point.x, point.y );
        }
      }
    }

    // Draw vertical lines.
    for ( j = 0; j <= 1; j += gridCellRatio ) {
      for ( i = 0; i <= 1; i += gridCellRatio ) {
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

  function draw() {
    handlers.forEach(function( handler ) {
      handler.draw();
    });

    warpCtx.clearRect( 0, 0, warpCtx.canvas.width, warpCtx.canvas.height );
    drawWarpGrid( warpCtx );

    gridCtx.clearRect( 0, 0, gridCtx.canvas.width, gridCtx.canvas.height );
    drawGridLines( gridCtx );
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

  function init() {
    var width  = handlersEl.clientWidth - 2 * padding,
        height = handlersEl.clientHeight - 2 * padding;

    // Create grid of handlers.
    var colWidth  = width  / ( xCount - 1 ),
        rowHeight = height / ( yCount - 1 );

    var handler;
    var i, j;
    for ( i = 0; i < yCount; i++ ) {
      for ( j = 0; j < xCount; j++ ) {
        handler = new Handler({
          x: j * colWidth + padding,
          y: i * rowHeight + padding,
          id: i * xCount + j
        });

        handlers.push( handler );
        handlersEl.appendChild( handler.el );
      }
    }

    draw();
  }

  init();
}) ( window, document );
