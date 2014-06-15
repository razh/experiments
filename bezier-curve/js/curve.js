/*globals Endpoint, ControlPoint*/
/*exported BezierCurve*/
var BezierCurve = (function() {
  'use strict';

  function BezierCurve() {
    this.p0 = new Endpoint();
    this.p1 = new ControlPoint();
    this.p2 = new ControlPoint();
    this.p3 = new Endpoint();

    // Set endpoints.
    if ( arguments.length === 4 ) {
      this.p0.set( arguments[0], arguments[1] );
      this.p3.set( arguments[2], arguments[3] );
    }

    // Set endpoint and control points.
    // For path continuation.
    if ( arguments.length === 6 ) {
      this.p1.set( arguments[0], arguments[1] );
      this.p2.set( arguments[2], arguments[3] );
      this.p3.set( arguments[4], arguments[5] );
    }

    // Set endpoints and control points.
    if ( arguments.length === 8 ) {
      this.p0.set( arguments[0], arguments[1] );
      this.p1.set( arguments[2], arguments[3] );
      this.p2.set( arguments[4], arguments[5] );
      this.p3.set( arguments[6], arguments[7] );
    }
  }

  BezierCurve.prototype.draw = function( ctx ) {
    ctx.moveTo( this.p0.x, this.p0.y );
    ctx.bezierCurveTo(
      this.p1.x, this.p1.y,
      this.p2.x, this.p2.y,
      this.p3.x, this.p3.y
    );
  };

  return BezierCurve;

}) ();
