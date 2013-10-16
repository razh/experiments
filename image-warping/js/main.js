/*globals URL*/
(function( window, document, undefined ) {
  'use strict';

  var handlersEl = document.getElementById( 'handlers' );

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = handlersEl.clientWidth;
  canvas.height = handlersEl.clientHeight;

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

  var handlers = [];

  var colCount = 4,
      rowCount = 4;


  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    image.src = URL.createObjectURL( event.dataTransfer.files[0] );
    image.onload = function() {
      context.drawImage( image, 0, 0 );
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
  }

  Handler.prototype.draw = function() {
    var transform = 'translate3d(' +
      this.x + 'px, ' +
      this.y + 'px, 0)';

    this.el.style.transform = this.el.style.webkitTransform = transform;
  };

  function drawGridLines( ctx ) {
    var x0, y0, x1, y1;
    var index;
    var i, j;

    ctx.beginPath();

    for ( i = 0; i < rowCount; i++ ) {
      for ( j = 0; j < colCount; j++ ) {
        index = i * colCount + j;

        x0 = handlers[ index ].x;
        y0 = handlers[ index ].y;


        // Draw columns
        if ( i ) {
          ctx.moveTo( x0, y0 );
          ctx.lineTo( handlers[ index - colCount ].x, handlers[ index - colCount ].y );
        }

        // if ( j ) {
        //   ctx.moveTo( x0, y0 );
        //   ctx.lineTo( handlers[ index + 1 ].x, handlers[ index + 1 ].y );
        // }
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
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
  });

  document.addEventListener( 'mouseup', function() {
    mouse.down = false;
  });

  function init() {
    // Create grid of handlers.
    var colWidth  = handlersEl.clientWidth  / ( colCount - 1 ),
        rowHeight = handlersEl.clientHeight / ( rowCount - 1 );

    var handler;
    var i, j;
    for ( i = 0; i < rowCount; i++ ) {
      for ( j = 0; j < colCount; j++ ) {
        handler = new Handler({
          x: j * colWidth,
          y: i * rowHeight,
          id: i * colCount + j
        });

        handler.draw();

        handlers.push( handler );
        handlersEl.appendChild( handler.el );
      }
    }

    drawGridLines( gridCtx );
  }

  init();
}) ( window, document );
