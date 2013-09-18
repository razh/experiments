/*globals $*/
$(function() {
  'use strict';

  var $editor = $( '#editor' ),
      $shape  = $( '#shape' );

  var $canvas = $( '#canvas-overlay' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );

  var editorWidth = $editor.width(),
      editorHeight = $editor.height();

  var shapeWidth = $shape.width(),
      shapeHeight = $shape.height();

  var polygon = [
    [ 10, 10 ],
    [ 10, editorHeight - 10 ],
    [ editorWidth - 10, editorHeight - 10 ],
    [ editorWidth - 10, 10 ]
  ];

  var selected = [],
      offsets = [];

  var pointSize = 10,
      halfPointSize = 0.5 * pointSize;

  function resizeCanvas() {
    $canvas.css({
      left: $editor.offset().left + 300,
      top: $editor.offset().top
    });

    canvas.width = editorWidth;
    canvas.height = editorHeight;

    draw( context );
    console.log( polygonToCSS( polygon ) );
  }

  resizeCanvas();

  $editor.on({
    mousemove: function() {

      if ( $editor.width()  !== editorWidth ||
           $editor.height() !== editorHeight ||
           $shape.width()   !== shapeWidth ||
           $shape.height()  !== shapeHeight ) {
        editorWidth  = $editor.width();
        editorHeight = $editor.height();

        shapeWidth  = $shape.width();
        shapeHeight = $shape.height();

        resizeCanvas();
      }
    }
  });

  function polygonToCSS( points ) {
    return 'polygon(' +
      points.map(function( point, index ) {
        var x = point[0] !== 0 ? point[0] + 'px' : 0,
            y = point[1] !== 0 ? point[1] + 'px' : 0;

        return x + ' ' + y + ( index < points.length - 1 ? ', ' : '' );
      }).join( '' ) +
    ')';
  }

  function draw( ctx ) {
    if ( !polygon.length ) {
      return;
    }

    function drawPoint( point ) {
      ctx.rect( point[0] - halfPointSize, point[1] - halfPointSize, pointSize, pointSize );
    }

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Draw polygon path.
    ctx.beginPath();

    ctx.moveTo( polygon[0][0], polygon[0][1] );
    for ( var i = 1, il = polygon.length; i < il; i++ ) {
      ctx.lineTo( polygon[i][0], polygon[i][1] );
    }

    ctx.closePath();

    ctx.lineWidth = 1;
    ctx.strokstyle = 'rgba(0, 0, 0, 1)';
    ctx.stroke();

    // Draw points.
    ctx.beginPath();

    polygon.forEach( drawPoint );

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fill();

    // Draw selected points.
    ctx.beginPath();

    selected.forEach( drawPoint );

    ctx.fillStyle = 'red';
    ctx.fill();

    $shape.css({
      '-webkit-shape-inside': polygonToCSS( polygon )
    });
  }

  function inRect( x, y, x0, y0, x1, y1 ) {
    return x0 <= x && x <= x1 &&
           y0 <= y && y <= y1;
  }

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function nearestPointOnSegment( x, y, x0, y0, x1, y1, radius ) {
    var radiusSquared = radius * radius;

    var lengthSquared = distanceSquared( x0, y0, x1, y1 );
    if ( !lengthSquared ) {
      if ( distanceSquared( x, y, x0, y0 ) < radiusSquared ) {
        return [ x0, y0 ];
      }

      return null;
    }

    var t = ( ( x - x0 ) * ( x1 - x0 ) + ( y - y0 ) * ( y1 - y0 ) ) / lengthSquared;
    if ( t <= 0 ) {
      if ( distanceSquared( x, y, x0, y0 ) < radiusSquared ) {
        return [ x0, y0 ];
      }

      return null;
    }

    if ( t >= 1 ) {
      if ( distanceSquared( x, y, x1, y1 ) < radiusSquared ) {
        return [ x1, y1 ];
      }

      return null;
    }

    var xt = lerp( x0, x1, t ),
        yt = lerp( y0, y1, t );
    if ( distanceSquared( x, y, xt, yt ) < radiusSquared ) {
      return [ xt, yt ];
    }

    return null;
  }

  $canvas.on({
    mousedown: function( event ) {
      var offset = $canvas.offset();

      var x = event.pageX - offset.left,
          y = event.pageY - offset.top;

      polygon.forEach(function( point ) {
        var x0 = point[0] - halfPointSize,
            y0 = point[1] - halfPointSize,
            x1 = point[0] + halfPointSize,
            y1 = point[1] + halfPointSize;

        if ( inRect( x, y, x0, y0, x1, y1 ) ) {
          selected.push( point );
          offsets.push([
            point[0] - x,
            point[1] - y
          ]);
        }
      });

      var i, il;
      var point;
      var x0, y0, x1, y1;
      if ( !selected.length )  {
        for ( i = 0, il = polygon.length; i < il; i += 2 ) {
          x0 = polygon[i][0];
          y0 = polygon[i][1];
          x1 = polygon[ ( i + 1 ) % il ][0];
          y1 = polygon[ ( i + 1 ) % il ][1];

          point = nearestPointOnSegment( x, y, x0, y0, x1, y1, 5 );
          if ( point ) {
            console.log( point );
            polygon.splice( i, 0, point );
            break;
          }
        }
      }

      draw( context );
    },

    mouseup: function() {
      selected = [];
      offsets = [];

      draw( context );
    },

    mousemove: function( event ) {
      var offset = $canvas.offset();

      var x = event.pageX - offset.left,
          y = event.pageY - offset.top;

      selected.forEach(function( point, index ) {
        point[0] = x - offsets[index][0];
        point[1] = y - offsets[index][1];
      });

      draw( context );
    }
  });
});
