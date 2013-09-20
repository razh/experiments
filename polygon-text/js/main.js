/*globals $*/
$(function() {
  'use strict';

  function detectShapeInside() {
    var el = document.createElement( 'div' );

    el.style.cssText = '-webkit-shape-inside: polygon(0 0, 0 100%, 100% 100%);';
    if ( el.style.length ) {
      return true;
    }

    el.style.cssText = '-shape-inside: polygon(0 0, 0 100%, 100% 100%);';
    if ( el.style.length ) {
      return true;
    }

    return false;
  }

  var $warning = $( '#shapes-warning' );

  if ( detectShapeInside() ) {
    $warning.hide();
  } else {
    $warning.show();
  }

  var PI2 = 2 * Math.PI;

  var $editor = $( '#editor' ),
      $shape  = $( '#shape' ),
      $css    = $( '#css' );

  var $canvas = $( '#canvas-overlay' ),
      canvas  = $canvas[0],
      context = canvas.getContext( '2d' );

  var editorWidth = $editor.width(),
      editorHeight = $editor.height();

  var shapeWidth = $shape.width(),
      shapeHeight = $shape.height();

  var editorPadding = parseInt( $editor.css( 'padding' ), 10 );

  var polygon = [
    [ editorPadding, editorPadding ],
    [ editorPadding, editorHeight - editorPadding ],
    [ editorWidth - editorPadding, editorHeight - editorPadding ],
    [ editorWidth - editorPadding, editorPadding ]
  ];

  var selected = [],
      offsets = [];

  var pointRadius = 8,
      pointInnerRadius = pointRadius - 2;

  var segmentRadius = 5;

  function resizeCanvas() {
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

    function drawPoint( point, radius ) {
      ctx.beginPath();
      ctx.arc( point[0], point[1], radius, 0, PI2 );
      ctx.fill();
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
    polygon.forEach(function( point ) {
      ctx.fillStyle = 'white';
      drawPoint( point, pointRadius );

      ctx.fillStyle = 'black';
      drawPoint( point, pointInnerRadius );
    });

    // Draw selected points.
    selected.forEach(function( point ) {
      ctx.fillStyle = 'white';
      drawPoint( point, pointRadius );

      ctx.fillStyle = '#d55';
      drawPoint( point, pointInnerRadius );
    });

    var polygonCSS = polygonToCSS( polygon );

    $shape.css({
      '-webkit-shape-inside': polygonCSS,
      '-shape-inside': polygonCSS
    });

    $css.text( polygonCSS );
  }

  function inRect( x, y, x0, y0, x1, y1 ) {
    return x0 <= x && x <= x1 &&
           y0 <= y && y <= y1;
  }

  function inCircle( x, y, cx, cy, radius ) {
    return distanceSquared( x, y, cx, cy ) < radius * radius;
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

  function addToSelected( object, x, y ) {
    selected.push( object );
    offsets.push([
      object[0] - x,
      object[1] - y
    ]);
  }

  $canvas.on({
    mousedown: function( event ) {
      var offset = $canvas.offset();

      var x = event.pageX - offset.left,
          y = event.pageY - offset.top;

      var hit = polygon.filter(function( point ) {
        return inCircle( x, y, point[0], point[1], pointRadius );
      });

      if ( event.altKey ) {
        // Delete points.
        hit.forEach(function( point ) {
          var index = polygon.indexOf( point );
          if ( index !== -1 ) {
            polygon.splice( index, 1 );
          }
        });
      } else {
        // Otherwise, add to selection.
        hit.forEach(function( point ) {
          addToSelected( point, x, y );
        });
      }

      // Add a point if nothing is selected, but we're on a line segment.
      var i, il;
      var point;
      var x0, y0, x1, y1;
      if ( !selected.length )  {
        for ( i = 0, il = polygon.length; i < il; i++ ) {
          x0 = polygon[i][0];
          y0 = polygon[i][1];
          x1 = polygon[ ( i + 1 ) % il ][0];
          y1 = polygon[ ( i + 1 ) % il ][1];

          point = nearestPointOnSegment( x, y, x0, y0, x1, y1, segmentRadius );

          if ( point ) {
            point[0] = Math.round( point[0] );
            point[1] = Math.round( point[1] );

            console.log( point );
            polygon.splice( i + 1, 0, point );
            addToSelected( point, x, y );
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
        point[0] = Math.round( x + offsets[index][0] );
        point[1] = Math.round( y + offsets[index][1] );
      });

      draw( context );
    }
  });
});
