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
  var controlPoints;

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
      0.2 * width, 0.2 * height,
      0.8 * width, 0.8 * height
    );

    cubicBezier( curve, 0.25, 0.1, 0.25, 1 );
    cp0 = curve.p1;
    cp1 = curve.p2;

    path = new BezierPath();
    path.push( new BezierCurve( 10, 20, 30, 50, 120, 30, 200, 90 ) );
    path.push( new BezierCurve( 80, 90, 180, 160, 110, 80, 80, 300 ) );

    controlPoints = path.controlPoints();
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

    // Draw nearest point to mouse.
    ctx.beginPath();
    ctx.arc( nearest.x, nearest.y, 8, 0, 2 * Math.PI );
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw nearest point to mouse line point.
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo( nearest.x, nearest.y );
    ctx.lineTo( mouse.x, mouse.y );
    ctx.stroke();

    // Draw path control points.
    ctx.lineWidth = 2;
    path.curves.forEach(function( curve ) {
      curve.controlPoints().forEach(function( controlPoint ) {
        ctx.beginPath();
        controlPoint.draw( ctx );
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

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  function onMouseDown( event ) {
    mousePosition( event );
    mouse.down = true;

    selection = controlPoints.concat( curve.controlPoints() )
    .filter(function( controlPoint ) {
      return controlPoint.contains( mouse.x, mouse.y, hitRadius );
    });

    offsets = selection.map(function( controlPoint ) {
      return new Point()
      .subVectors( controlPoint, mouse );
    });
  }

  function onMouseMove( event ) {
    mousePosition( event );

    // Wait for Object.observe changes to propagate.
    requestAnimationFrame( draw );

    // Update nearest point.
    nearest = NearestPoint.nearestPointOnCurve(
      new Point().copy( mouse ),
      curve.controlPoints()
    );

    if ( !mouse.down ) {
      return;
    }

    selection.forEach(function( element, index ) {
      Object.getNotifier( element )
        .performChange( 'input', function() {
          var oldValue = new Point().copy( element );
          element.addVectors( mouse, offsets[ index ] );

          if ( event.shiftKey &&
               element instanceof ControlPoint &&
               element.endpoint ) {
            element.orthogonalTo( element.endpoint );
          }

          return {
            oldValue: oldValue
          };
        });
    });
  }

  function onMouseUp() {
    mouse.down = false;
  }

  function onDblClick( event ) {
    mousePosition( event );

    controlPoints.filter(function( controlPoint ) {
      return controlPoint instanceof Endpoint &&
        controlPoint.contains( mouse.x, mouse.y, hitRadius );
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

  init();
  draw = draw.bind( this, context );
  draw();

  canvas.addEventListener( 'mousedown', onMouseDown );
  canvas.addEventListener( 'mousemove', onMouseMove );
  canvas.addEventListener( 'mouseup', onMouseUp );
  canvas.addEventListener( 'dblclick', onDblClick );

}) ( window, document );
