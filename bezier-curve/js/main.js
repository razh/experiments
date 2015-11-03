/*jshint bitwise:false*/
/*globals requestAnimationFrame,
ControlPoint, Endpoint, Point,
BezierCurve, BezierPath,
NearestPoint*/
(function( window, document, undefined ) {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function cubicBezier( curve, x1, y1, x2, y2 ) {
    curve.p1.x = lerp( curve.p0.x, curve.p3.x, x1 );
    curve.p1.y = lerp( curve.p0.y, curve.p3.y, y1 );

    curve.p2.x = lerp( curve.p0.x, curve.p3.x, x2 );
    curve.p2.y = lerp( curve.p0.y, curve.p3.y, y2 );

    return curve;
  }


  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var curve;
  var cp0, cp1;
  var nearest = {
    x: 0,
    y: 0
  };

  var path;
  var points;
  var pathNearest = {
    point: {
      x: 0,
      y: 0
    },
  };

  var mouse = {
    x: 0,
    y: 0,

    down: false
  };

  var hitRadius = 16;

  var selection = [];
  var offsets = [];

  function init() {
    var width  = window.innerWidth,
        height = window.innerHeight;

    canvas.width  = width;
    canvas.height = height;

    curve = new BezierCurve(
      0.2 * width, 0.3 * height,
      0.8 * width, 0.8 * height
    );

    cubicBezier( curve, 0.25, 0.1, 0.25, 1 );
    cp0 = curve.p1;
    cp1 = curve.p2;

    path = new BezierPath();
    path.push( new BezierCurve( 30, 20, 30, 80, 120, 30, 200, 100 ) );
    path.push( new BezierCurve( 80, 90, 150, 190, 50, 120, 70, 300 ) );

    points = path.points();
  }

  function update() {
    points.filter(function( point ) {
      return point.dirty;
    }).forEach(function( point ) {
      point.update();
    });
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';

    // Draw curve.
    ctx.beginPath();
    curve.draw( ctx );
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw path.
    ctx.beginPath();
    path.draw( ctx );
    ctx.stroke();

    // Draw control points.
    ctx.beginPath();
    cp0.draw( ctx );
    cp1.draw( ctx );
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw nearest points to mouse.
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc( nearest.x, nearest.y, 8, 0, 2 * Math.PI );
    ctx.fill();

    ctx.beginPath();
    ctx.arc( pathNearest.point.x, pathNearest.point.y, 8, 0, 2 * Math.PI );
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw polyline from nearest points to mouse.
    ctx.globalAlpha = 0.2;

    ctx.beginPath();
    ctx.moveTo( nearest.x, nearest.y );
    ctx.lineTo( mouse.x, mouse.y );
    ctx.lineTo( pathNearest.point.x, pathNearest.point.y );
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Draw path control points.
    ctx.lineWidth = 2;
    path.curves.forEach(function( curve ) {
      curve.points().forEach(function( point ) {
        ctx.beginPath();
        point.draw( ctx );
        ctx.stroke();
      });

      // Connect to bezier curve endpoints.
      ctx.beginPath();
      ctx.moveTo( curve.p0.x, curve.p0.y );
      ctx.lineTo( curve.p1.x, curve.p1.y );
      ctx.moveTo( curve.p2.x, curve.p2.y );
      ctx.lineTo( curve.p3.x, curve.p3.y );
      ctx.stroke();
    });

    // Draw line segments from endpoints to control points.
    ctx.beginPath();
    ctx.moveTo( curve.p0.x, curve.p0.y );
    ctx.lineTo( curve.p1.x, curve.p1.y );
    ctx.moveTo( curve.p3.x, curve.p3.y );
    ctx.lineTo( curve.p2.x, curve.p2.y );
    ctx.stroke();
  }

  function tick() {
    update();
    draw( context );
  }

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  function onMouseDown( event ) {
    mousePosition( event );
    mouse.down = true;

    selection = points.concat( curve.points() )
    .filter(function( point ) {
      return point.contains( mouse.x, mouse.y, hitRadius );
    });

    offsets = selection.map(function( point ) {
      return new Point()
      .subVectors( point, mouse );
    });
  }

  function onMouseMove( event ) {
    mousePosition( event );

    // Wait for Object.observe changes to propagate.
    requestAnimationFrame( tick );

    // Update nearest points.
    var mousePoint = new Point().copy( mouse );
    nearest = NearestPoint.nearestPointOnCurve(
      mousePoint,
      curve.points()
    );

    // Determine the nearest point to a path.
    pathNearest = (function() {
      var minDistance = Number.POSITIVE_INFINITY;
      var min = {};

      path.curves.map(function( curve ) {
        return {
          curve: curve,

          point: NearestPoint.nearestPointOnCurve(
            mousePoint,
            curve.points()
          ),

          t: NearestPoint.nearestPointOnCurveParameter(
            mousePoint,
            curve.points()
          )
        };
      }).forEach(function( object ) {
        var distance = mousePoint.distanceToSquared( object.point );

        if ( distance < minDistance ) {
          min = object;
          minDistance = distance;
        }
      });

      return min;
    }) ();

    if ( !mouse.down ) {
      return;
    }

    selection.forEach(function( element, index ) {
      element.px = element.x;
      element.py = element.y;
      element.dirty = true;

      element.addVectors( mouse, offsets[ index ] );

      if ( event.shiftKey &&
           element instanceof ControlPoint &&
           element.endpoint ) {
        element.orthogonalTo( element.endpoint );
      }
    });
  }

  function onMouseUp() {
    mouse.down = false;
  }

  function onDblClick( event ) {
    mousePosition( event );

    points.filter(function( point ) {
      return point instanceof Endpoint &&
        point.contains( mouse.x, mouse.y, hitRadius );
    }).forEach(function( endpoint ) {
      switch ( endpoint.type ) {
        case Endpoint.Type.DISCONNECTED:
          endpoint.type = Endpoint.Type.MIRROR;
          break;

        case Endpoint.Type.MIRROR:
          endpoint.type = Endpoint.Type.ASYMMETRIC;
          break;

        case Endpoint.Type.ASYMMETRIC:
          endpoint.type = Endpoint.Type.DISCONNECTED;
          break;

        default:
          endpoint.type = Endpoint.Type.DISCONNECTED;
      }
    });
  }

  function onKeyDown( event ) {
    var curve;
    var index;

    switch ( event.which ) {
      // Space. Split a curve.
      case 32:
        curve = pathNearest.curve;
        if ( !curve ) {
          return;
        }

        index = path.curves.indexOf( curve );
        if ( index === -1 ) {
          break;
        }

        // Create new curves from split.
        var split = curve.split( pathNearest.t );
        var curve0 = BezierCurve.fromArray( split[0] ),
            curve1 = BezierCurve.fromArray( split[1] );

        // Remove old curve.
        path.removeAt( index );

        // Add new curves.
        path.insertAt( curve1, index );
        path.insertAt( curve0, index );

        // Update new control points.
        points = path.points();
        requestAnimationFrame( tick );
        break;

      // A. Add a curve to the path end.
      case 65:
        var last = path.last().p3;
        var t0 = 0.25,
            t1 = 0.75;

        path.push(
          new BezierCurve(
            last.x, last.y,
            lerp( last.x, mouse.x, t0 ), lerp( last.y, mouse.y, t0 ),
            lerp( last.x, mouse.x, t1 ), lerp( last.y, mouse.y, t1 ),
            mouse.x, mouse.y
          )
        );

        points = path.points();
        requestAnimationFrame( tick );
        break;

      // D. Delete the nearest endpoint.
      case 68:
        // Prevent degenerate paths.
        if ( path.curves.length < 2 ) {
          return;
        }

        curve = pathNearest.curve;
        index = path.curves.indexOf( curve );

        var other;
        var lastIndex;
        // We copy the sibling endpoint and control point so that only the
        // nearest endpoint and its child control points appear to be removed.
        //
        // We do not want to remove the entire curve. All other endpoints and
        // control points should appear to stay in place.
        if ( pathNearest.t < 0.5 ) {
          // Remove previous curve.
          if ( index > 0 ) {
            other = path.curves[ index - 1 ];
            curve.p0.copy( other.p0 );
            curve.p1.copy( other.p1 );
          }

          path.removeAt( Math.max( index - 1, 0 ) );
        } else {
          // Remove current curve.
          lastIndex = path.curves.length - 1;
          if ( index < lastIndex ) {
            other = path.curves[ index + 1 ];
            other.p0.copy( curve.p0 );
            other.p1.copy( curve.p1 );
          }

          path.remove( curve );
        }

        points = path.points();
        requestAnimationFrame( tick );
        break;

      // P. Print out path data.
      case 80:
        console.log( path.toArray() );
        break;
    }
  }

  init();
  tick();

  if ( 'ontouchstart' in window ) {
    canvas.addEventListener( 'touchstart', function( event ) {
      onMouseDown( event.touches[0] );
    });

    canvas.addEventListener( 'touchmove', function( event ) {
      event.preventDefault();
      onMouseMove( event.touches[0] );
    });

    canvas.addEventListener( 'touchend', onMouseUp );
  } else {
    canvas.addEventListener( 'mousedown', onMouseDown );
    canvas.addEventListener( 'mousemove', onMouseMove );
    canvas.addEventListener( 'mouseup', onMouseUp );
    canvas.addEventListener( 'dblclick', onDblClick );
  }

  document.addEventListener( 'keydown', onKeyDown );

}) ( window, document );
