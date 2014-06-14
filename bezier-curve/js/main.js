/*jshint bitwise:false*/
(function( window, document, undefined ) {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function BezierCurve( x0, y0, x1, y1, cpx0, cpy0, cpx1, cpy1 ) {
    this.x0 = x0 || 0;
    this.y0 = y0 || 0;

    this.x1 = x1 || 0;
    this.y1 = y1 || 0;

    this.cpx0 = cpx0 || 0;
    this.cpy0 = cpy0 || 0;

    this.cpx1 = cpx1 || 0;
    this.cpy1 = cpy1 || 0;
  }

  BezierCurve.prototype.draw = function( ctx ) {
    ctx.moveTo( this.x0, this.y0 );
    ctx.bezierCurveTo(
      this.cpx0, this.cpy0,
      this.cpx1, this.cpy1,
      this.x1, this.y1
    );
  };

  BezierCurve.prototype.createControlPoints = function() {
    return [
      new ControlPoint( this, 0 ),
      new ControlPoint( this, 1 ),
    ];
  };

  function ControlPoint( curve, index ) {
    this.curve = curve || null;
    this.index = index || 0;
  }

  ControlPoint.prototype.draw = function( ctx ) {
    var cpx = this.curve[ 'cpx' + this.index ],
        cpy = this.curve[ 'cpy' + this.index ];

    ctx.rect( cpx - 4, cpy - 4, 8, 8 );
  };

  ControlPoint.prototype.contains = function( x, y ) {
    var dx = x - this.x,
        dy = y - this.y;

    var distanceSquared = dx * dx + dy * dy;

    var radius = 6;
    var radiusSquared = radius * radius;

    if ( distanceSquared < radiusSquared ) {
      return true;
    }

    return false;
  };

  Object.defineProperty( ControlPoint.prototype, 'x', {
    get: function() {
      return this.curve[ 'cpx' + this.index ];
    },

    set: function( x ) {
      this.curve[ 'cpx' + this.index ] = x;
      return x;
    }
  });

  Object.defineProperty( ControlPoint.prototype, 'y', {
    get: function() {
      return this.curve[ 'cpy' + this.index ];
    },

    set: function( y ) {
      this.curve[ 'cpy' + this.index ] = y;
      return y;
    }
  });

  // Set the coordinates of the other control point.
  Object.defineProperty( ControlPoint.prototype, 'nx', {
    get: function() {
      return this.curve[ 'cpx' + this.index ^ 1 ];
    },

    set: function( x ) {
      this.curve[ 'cpx' + this.index ^ 1 ] = x;
      return x;
    }
  });

  Object.defineProperty( ControlPoint.prototype, 'ny', {
    get: function() {
      return this.curve[ 'cpy' + this.index ^ 1 ];
    },

    set: function( y ) {
      this.curve[ 'cpy' + this.index ^ 1 ] = y;
      return y;
    }
  });

  function cubicBezier( curve, x1, y1, x2, y2 ) {
    curve.cpx0 = lerp( curve.x0, curve.x1, x1 );
    curve.cpy0 = lerp( curve.y0, curve.y1, y1 );

    curve.cpx1 = lerp( curve.x0, curve.x1, x2 );
    curve.cpy1 = lerp( curve.y0, curve.y1, y2 );

    return curve;
  }

  function BezierPath() {
    this.curves = [];
  }

  BezierPath.prototype.draw = function( ctx ) {
    if ( !this.curves.length ) {
      return;
    }

    var curve = this.curves[0];
    ctx.moveTo( curve.x0, curve.y0 );
    for ( var i = 0, il = this.curves.length; i < il; i++ ) {
      curve = this.curves[i];
      ctx.bezierCurveTo(
        curve.cpx0, curve.cpy0,
        curve.cpx1, curve.cpy1,
        curve.x1, curve.y1
      );
    }
  };

  BezierPath.prototype.createControlPoints = function() {
    return this.curves.reduce(function( array, curve ) {
      return array.concat( curve.createControlPoints() );
    }, [] );
  };


  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var curve;
  var cp0, cp1;

  var path;
  var controlPoints;

  var mouse = {
    x: 0,
    y: 0,

    down: false
  };

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
    cp0 = new ControlPoint( curve, 0 );
    cp1 = new ControlPoint( curve, 1 );

    path = new BezierPath();
    path.curves.push( new BezierCurve( 10, 20, 80, 90, 30, 50, 70, 80 ) );
    path.curves.push( new BezierCurve( 80, 90, 80, 300, 90, 120, 110, 80 ) );

    controlPoints = path.createControlPoints();
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.strokeStyle = '#fff';

    // Draw curve.
    ctx.beginPath();
    curve.draw( ctx );
    ctx.lineCap = 'round';
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
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw path control points.
    controlPoints.forEach(function( controlPoint ) {
      ctx.beginPath();
      controlPoint.draw( ctx );

      // Connect to bezier curve endpoints.
      var index = controlPoint.index;
      ctx.moveTo( controlPoint.x, controlPoint.y );
      ctx.lineTo(
        controlPoint.curve[ 'x' + index ],
        controlPoint.curve[ 'y' + index ]
      );

      ctx.stroke();
    });

    // Draw line segments from endpoints to control points.
    ctx.beginPath();
    ctx.moveTo( curve.x0, curve.y0 );
    ctx.lineTo( curve.cpx0, curve.cpy0 );
    ctx.moveTo( curve.x1, curve.y1 );
    ctx.lineTo( curve.cpx1, curve.cpy1 );
    ctx.stroke();
  }

  function mousePosition( event ) {
    mouse.x = event.pageX - canvas.offsetLeft;
    mouse.y = event.pageY - canvas.offsetTop;
  }

  function onMouseDown( event ) {
    mousePosition( event );
    mouse.down = true;

    selection = controlPoints.filter(function( controlPoint ) {
      return controlPoint.contains( mouse.x, mouse.y );
    });

    offsets = selection.map(function( controlPoint ) {
      return {
        x: controlPoint.x - mouse.x,
        y: controlPoint.y - mouse.y
      };
    });
  }

  function onMouseMove( event ) {
    mousePosition( event );
    if ( !mouse.down ) {
      return;
    }

    selection.forEach(function( element, index ) {
      var offset = offsets[ index ];
      element.x = mouse.x + offset.x;
      element.y = mouse.y + offset.y;
    });

    draw( context );
  }

  function onMouseUp() {
    mouse.down = false;
  }

  init();
  draw( context );

  document.addEventListener( 'mousedown', onMouseDown );
  document.addEventListener( 'mousemove', onMouseMove );
  document.addEventListener( 'mouseup', onMouseUp );

}) ( window, document );
