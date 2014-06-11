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

  function ControlPoint( curve, index ) {
    this.curve = curve || null;
    this.index = index || 0;
  }

  ControlPoint.prototype.draw = function( ctx ) {
    var cpx = this.curve[ 'cpx' + this.index ],
        cpy = this.curve[ 'cpy' + this.index ];

    ctx.rect( cpx - 4, cpy - 4, 8, 8 );
  };

  function cubicBezier( curve, x1, y1, x2, y2 ) {
    curve.cpx0 = lerp( curve.x0, curve.x1, x1 );
    curve.cpy0 = lerp( curve.y0, curve.y1, y1 );

    curve.cpx1 = lerp( curve.x0, curve.x1, x2 );
    curve.cpy1 = lerp( curve.y0, curve.y1, y2 );

    return curve;
  }


  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  var curve;
  var cp0, cp1;

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

    // Draw control points.
    ctx.beginPath();
    cp0.draw( ctx );
    cp1.draw( ctx );
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw line segments from endpoints to control points.
    ctx.beginPath();
    ctx.moveTo( curve.x0, curve.y0 );
    ctx.lineTo( curve.cpx0, curve.cpy0 );
    ctx.moveTo( curve.x1, curve.y1 );
    ctx.lineTo( curve.cpx1, curve.cpy1 );
    ctx.stroke();
  }

  init();
  draw( context );

}) ( window, document );
