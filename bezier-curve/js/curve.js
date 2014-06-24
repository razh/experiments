/*globals Endpoint, ControlPoint*/
/*exported BezierCurve*/
var BezierCurve = (function() {
  'use strict';

  function BezierCurve() {
    var x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0,
        x3 = 0,
        y3 = 0;

    // Set from existing endpoints.
    if ( arguments.length === 2 ) {
      this.p0 = arguments[0];
      this.p1 = this.p0.next;
      this.p3 = arguments[2];
      this.p2 = this.p3.prev;
      return this;
    }

    // Set endpoints.
    if ( arguments.length === 4 ) {
      x0 = arguments[0];
      y0 = arguments[1];
      x3 = arguments[2];
      y3 = arguments[3];
    }

    // Set endpoint and control points.
    // For path continuation.
    if ( arguments.length === 6 ) {
      x1 = arguments[0];
      y1 = arguments[1];
      x2 = arguments[2];
      y2 = arguments[3];
      x3 = arguments[4];
      y3 = arguments[5];
    }

    // Set endpoints and control points.
    if ( arguments.length === 8 ) {
      x0 = arguments[0];
      y0 = arguments[1];
      x1 = arguments[2];
      y1 = arguments[3];
      x2 = arguments[4];
      y2 = arguments[5];
      x3 = arguments[6];
      y3 = arguments[7];
    }

    this.p0 = new Endpoint( x0, y0 );
    this.p1 = this.p0.next = new ControlPoint( x1, y1 );
    this.p3 = new Endpoint( x3, y3 );
    this.p2 = this.p3.prev = new ControlPoint( x2, y2 );
  }

  BezierCurve.prototype.draw = function( ctx ) {
    ctx.moveTo( this.p0.x, this.p0.y );
    ctx.bezierCurveTo(
      this.p1.x, this.p1.y,
      this.p2.x, this.p2.y,
      this.p3.x, this.p3.y
    );
  };

  BezierCurve.prototype.controlPoints = function() {
    return [ this.p0, this.p1, this.p2, this.p3 ];
  };

  BezierCurve.prototype.linkTo = function( curve ) {
    var next = this.p0.next.unobserve();
    this.p0 = curve.p3;
    this.p0.next = next;
    return this;
  };

  BezierCurve.prototype.unlink = function() {
    this.p0 = this.p0.clone();
    return this;
  };

  BezierCurve.prototype.toArray = function() {
    return [
      this.p0.x, this.p0.y,
      this.p1.x, this.p1.y,
      this.p2.x, this.p2.y,
      this.p3.x, this.p3.y
    ];
  };

  // Define public getters and setters for individual coordinates.
  // Favors convenience over speed.
  [ 'p0', 'p1', 'p2', 'p3' ].forEach(function( point, index ) {
    [ 'x', 'y' ].forEach(function( axis ) {
      var prop = axis + index;

      Object.defineProperty( BezierCurve.prototype, prop, {
        get: function() {
          return this[ point ][ prop ];
        },

        set: function( value ) {
          this[ point ][ prop ] = value;
          return value;
        }
      });
    });
  });

  return BezierCurve;

}) ();
