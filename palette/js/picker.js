var Picker = (function( document ) {
  'use strict';

  var canvas;

  (function() {
    var WIDTH  = 360,
        HEIGHT = 100;

    canvas = document.createElement( 'canvas' );
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = canvas.getContext( '2d' );

    console.time( 'render' );

    var x, y;
    for ( y = 0; y < HEIGHT; y++ ) {
      for ( x = 0; x < WIDTH; x++ ) {
        ctx.fillStyle = 'hsl(' +
          x + ', '+
          y + '%, 50%)';

        ctx.fillRect( x, HEIGHT - y, 1, 1 );
      }
    }

    console.timeEnd( 'render' );

    document.body.appendChild( canvas );
  }) ();

  var Picker = {};

  Picker.create = function() {};

  return Picker;
}) ( document );
