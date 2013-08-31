/*globals $, requestAnimationFrame*/
$(function() {
  'use strict';

  var selection = [];
  var offsets = [];
  var stage = [];

  var PI2 = 2 * Math.PI;
  var DEG_TO_RAD = Math.PI / 180,
      RAD_TO_DEG = 180 / Math.PI;

  var mouse = {
    x: null,
    y: null
  };

  var config = {
    handler: {
      radius: 10
    }
  };

  var backgroundColor = '#888';

  var snapping = true;

  function Handler( x, y, radius ) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.radius = radius || 0.0;
  }

  Handler.prototype.draw = function( ctx ) {
    // Draw outer circle.
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius, 0, PI2 );
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw inner circle.
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius - 3, 0, PI2 );
    ctx.fillStyle = '#222'; //'rgba(255, 0, 0, 1.0)';
    ctx.fill();
  };

  Handler.prototype.contains = function( x, y ) {
    var dx = x - this.x,
        dy = y - this.y;

    return Math.sqrt( dx * dx + dy * dy ) < this.radius;
  };

  function Sphere( x, y, radius ) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.radius = radius || 0.0;

    this.handlers = [
      // Start angle.
      new Handler(
        this.x + Math.cos( 315 * DEG_TO_RAD ) * this.radius,
        this.y + Math.sin( 315 * DEG_TO_RAD ) * this.radius,
        config.handler.radius
      ),
      // End angle.
      new Handler(
        this.x + Math.cos( 90 * DEG_TO_RAD ) * this.radius,
        this.y + Math.sin( 90 * DEG_TO_RAD ) * this.radius,
        config.handler.radius
      ),
      new Handler(
        this.x + 0.5 * this.radius,
        this.y + 0.5 * this.radius,
        config.handler.radius
      )
    ];
  }

  Sphere.prototype.draw = function( ctx ) {
    ctx.beginPath();
    ctx.arc( this.x, this.y, this.radius, 0, PI2 );
    ctx.fillStyle = 'rgba( 250, 120, 80, 1.0)';
    ctx.fill();

    var h0 = this.handlers[0],
        h1 = this.handlers[1],
        h2 = this.handlers[2];

    if ( snapping ) {
      var cp = closestPointOnCircle( h0.x, h0.y, this.x, this.y, this.radius );
      h0.x = cp.x;
      h0.y = cp.y;

      cp = closestPointOnCircle( h1.x, h1.y, this.x, this.y, this.radius );
      h1.x = cp.x;
      h1.y = cp.y;

      var perp = perpendicular( h0.x, h0.y, h1.x, h1.y );

      ctx.beginPath();
      ctx.moveTo( perp.x0, perp.y0 );
      ctx.lineTo( perp.x1, perp.y1 );

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'white';
      ctx.stroke();

      cp = closestPointOnLine( h2.x, h2.y, perp.x0, perp.y0, perp.x1, perp.y1 );
      h2.x = cp.x;
      h2.y = cp.y;
    }

    var circle = circleFromPoints(
      h0.x, h0.y,
      h1.x, h1.y,
      h2.x, h2.y
    );

    if ( circle ) {
      ctx.beginPath();
      ctx.arc( circle.x, circle.y, circle.radius, 0, PI2 );
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.stroke();

      ctx.beginPath();
      var startAngle = angleFrom( this.x, this.y, h0.x, h0.y ),
          endAngle   = angleFrom( this.x, this.y, h1.x, h1.y );
      ctx.arc( this.x, this.y, this.radius, startAngle, endAngle );

      startAngle = angleFrom( circle.x, circle.y, h0.x, h0.y );
      endAngle   = angleFrom( circle.x, circle.y, h1.x, h1.y );
      var midAngle = angleFrom( circle.x, circle.y, h2.x, h2.y );
      ctx.arc( circle.x, circle.y, circle.radius, endAngle, startAngle, segmentLeft( h2.x, h2.y, h0.x, h0.y, h1.x, h1.y ) );


      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      ctx.font = '12px Monaco';
      var startText = 'start: ' + ( startAngle * RAD_TO_DEG ).toFixed(1) + ', ' + ( startAngle < endAngle ) + ', ' + ( segmentLeft( h2.x, h2.y, h0.x, h0.y, h1.x, h1.y ) ? 'left' : 'right' ),
          endText   = 'end: '   + ( endAngle   * RAD_TO_DEG ).toFixed(1);

      var midText = 'mid: ' + ( midAngle * RAD_TO_DEG ).toFixed(1);

      ctx.fillStyle = 'white';
      ctx.fillText( startText, h0.x + 20, h0.y );
      ctx.fillStyle = 'rgba(0, 255, 0, 1.0)';
      ctx.fillText( endText,   h1.x + 20, h1.y );
      ctx.fillStyle = 'rgba(255, 255, 0, 1.0)';
      ctx.fillText( midText, h2.x + 20, h2.y );
    }
  };

  Sphere.prototype.contains = function() {
    return false;
  };

  function tick() {
    draw( context );
    requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    stage.forEach(function( object ) {
      object.draw( ctx );
    });
  }

  function mousePosition( event ) {
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    };
  }

  function onMouseDown( event ) {
    mouse = mousePosition( event );

    var object;
    for ( var i = 0, il = stage.length; i < il; i++ ) {
      object = stage[i];
      if ( object.contains( mouse.x, mouse.y ) ) {
        selection.push( object );
        offsets.push({
          x: object.x,
          y: object.y
        });
      }
    }
  }

  function onMouseMove( event ) {
    var point = mousePosition( event );

    var dx = point.x - mouse.x,
        dy = point.y - mouse.y;

    selection.forEach(function( object, index ) {
      object.x = offsets[ index ].x + dx;
      object.y = offsets[ index ].y + dy;
    });
  }

  function onMouseUp() {
    selection = [];
    offsets = [];
  }

  function circleFromPoints( x0, y0, x1, y1, x2, y2 ) {
    /**
     * Given the equation of a circle located at (xc, yc) and with a radius r:
     *
     * (x - xc)^2 + (y - yc)^2 = r^2
     *
     * We substitute the coords of the three points, and get three equations
     * for three unknowns:
     *
     * (x0 - xc)^2 + (y0 - yc)^2 = r^2
     * (x1 - xc)^2 + (y1 - yc)^2 = r^2
     * (x2 - xc)^2 + (y2 - yc)^2 = r^2
     *
     * By subtracting the first from the second and third equations and
     * constructing a system of linear equations. With  some algebraic
     * manipulation, we eventually get:
     *
     * xc = [(x1^2 - y0^2) + (y1^2 - y0^2)] - (y1 - y0) /(y2 - y0) * [(x2^2 - x0^2) + (y2^2 - y0^2)]
     *      ----------------------------------------------------------------------------------------
     *                           2[x1 - x0 - (y1 - y0) / (y2 - y0) * (x2 - x0)]
     *
     * yc = [(x1^2 - y0^2) + (y1^2 - y0^2)] - (x1 - x0) /(x2 - x0) * [(x2^2 - x0^2) + (y2^2 - y0^2)]
     *      ----------------------------------------------------------------------------------------
     *                           2[y1 - y0 - (x1 - x0) / (x2 - x0) * (y2 - y0)]
     *
     * Plug xc and yc back in to solve for the radius.
     */

    var dx10 = x1 - x0,
        dy10 = y1 - y0,
        dx20 = x2 - x0,
        dy20 = y2 - y0;

    if ( !dx20 || !dy20 ) {
      if ( !dx10 || !dy10 ) {
        // Don't do anything if degenerate.
        return;
      }

      // Swap vars so it can work.
      var temp = x1;
      x1 = x2;
      x2 = temp;

      temp = y1;
      y1 = y2;
      y2 = temp;

      dx10 = x1 - x0;
      dy10 = y1 - y0;
      dx20 = x2 - x0;
      dy20 = y2 - y0;
    }

    // Differences of squares. e.g. x1^2 - x0^2.
    var dsqx10 = dx10 * ( x1 + x0 ),
        dsqy10 = dy10 * ( y1 + y0 ),
        dsqx20 = dx20 * ( x2 + x0 ),
        dsqy20 = dy20 * ( y2 + y0 );

    // Ratios, e.g. rdx10dx20 = (x1 - x0) / (x2 - x0).
    var rdx10dx20 = dx10 / dx20,
        rdy10dy20 = dy10 / dy20;

    // Denominators.
    var xden = 2 * ( dx10 - rdy10dy20 * dx20 ),
        yden = 2 * ( dy10 - rdx10dx20 * dy20 );

    if ( !xden || !yden ) {
      return;
    }

    var x = ( ( dsqx10 + dsqy10 ) - rdy10dy20 * ( dsqx20 + dsqy20 ) ) / xden,
        y = ( ( dsqx10 + dsqy10 ) - rdx10dx20 * ( dsqx20 + dsqy20 ) ) / yden;

    // Now solve for the radius.
    var r = Math.sqrt( ( x0 - x ) * ( x0 - x ) + ( y0 - y ) * ( y0 - y ) );

    return {
      x: x,
      y: y,
      radius: r
    };
  }

  /**
   * Determines the angle from x0, y0 to x1, y1.
   * Returns the angle in radians.
   */
  function angleFrom( x0, y0, x1, y1 ) {
    return Math.atan2( y1 - y0, x1 - x0 );
  }

  /**
   * Given the point (x, y), find the closest point on the line given by
   * (x0, y0) -> (x1, y1).
   */
  function closestPointOnLine( x, y, x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    // Check for line degeneracy.
    if ( !dx && !dy ) {
      return;
    }

    var lengthSquared = dx * dx + dy * dy;

    // Calculate parameter of closest point on line segment.
    var t = ( ( x - x0 ) * ( x1 - x0 ) + ( y - y0 ) * ( y1 - y0 ) ) / lengthSquared;

    return {
      x: x0 + t * ( x1 - x0 ),
      y: y0 + t * ( y1 - y0 )
    };
  }

  /**
   * Given the point (x, y), find the closest point on the circle defined by a
   * center point (cx, cy) and radius.
   */
  function closestPointOnCircle( x, y, cx, cy, radius ) {
    var angle = angleFrom( cx, cy, x, y );
    return {
      x: cx + Math.cos( angle ) * radius,
      y: cy + Math.sin( angle ) * radius
    };
  }

  /**
   * Returns the perpendicular line segment to the line segment given by
   * (x0, y0) and (x1, y1), The two line segments form the diagonals of a
   * square.
   *
   * The (x0, y0) of the resulting line segment will be counterclockwise from
   * the (x0, y0) of the original line segment.
   */
  function perpendicular( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    // Midpoint.
    var mx = x0 + 0.5 * dx,
        my = y0 + 0.5 * dy;

    return {
      x0: mx - 0.5 * dy,
      y0: my + 0.5 * dx,
      x1: mx + 0.5 * dy,
      y1: my - 0.5 * dx
    };
  }

  /**
   * Returns if the point (x, y) is to the left of the line segment defined
   * by (x0, y0) and (x1, y1).
   *
   * This is the cross product.
   *
   * Returns true if left, false if right.
   */
  function segmentLeft( x, y, x0, y0, x1, y1 ) {
    return ( ( x - x0 ) * ( y1 - y0 ) - ( y - y0 ) * ( x1 - x0 ) ) > 0;
  }

  var $canvas = $( '#canvas' );
  var canvas = $canvas[0];
  var context = canvas.getContext( '2d' );

  $canvas.on({
    mousedown: onMouseDown,
    mousemove: onMouseMove,
    mouseup: onMouseUp
  });

  $canvas.css( 'position', 'absolute' );
  canvas.width = 1920; // window.innerWidth;
  canvas.height = window.innerHeight;

  stage.push(
    new Sphere( 300, 0.5 * canvas.height, 100 ),
    new Sphere( 700, 0.5 * canvas.height, 100 ),
    new Sphere( 1100, 0.5 * canvas.height, 100 ),
    new Sphere( 1500, 0.5 * canvas.height, 100 )
  );

  var sph0 = stage[0],
      sph1 = stage[1],
      sph2 = stage[2];

  // First sphere.
  sph0.handlers[2].x = sph0.x - 0.25 * sph0.radius;
  sph0.handlers[2].y = sph0.y - 0.25 * sph0.radius;

  // Second sphere.
  sph1.handlers[1].x = sph1.x + Math.cos( 225 * DEG_TO_RAD ) * sph1.radius;
  sph1.handlers[1].y = sph1.y + Math.sin( 225 * DEG_TO_RAD ) * sph1.radius;
  sph1.handlers[2].x = sph1.x;
  sph1.handlers[2].y = sph1.y - 1.25 * sph1.radius;

  // Third sphere.
  sph2.handlers[1].x = sph2.x + Math.cos( 225 * DEG_TO_RAD ) * sph2.radius;
  sph2.handlers[1].y = sph2.y + Math.sin( 225 * DEG_TO_RAD ) * sph2.radius;
  sph2.handlers[2].x = sph2.x;
  sph2.handlers[2].y = sph2.y;


  stage.forEach(function( object ) {
    if ( object instanceof Sphere ) {
      stage.push.apply( stage, object.handlers );
    }
  });

  tick();
});
