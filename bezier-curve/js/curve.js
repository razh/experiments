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

  /**
   * Returns the coordinate arrays of the curves formed by the split at
   * parameter t.
   */
  BezierCurve.prototype.split = function( t ) {
    var x0 = this.p0.x,
        y0 = this.p0.y,
        x1 = this.p1.x,
        y1 = this.p1.y,
        x2 = this.p2.x,
        y2 = this.p2.y,
        x3 = this.p3.x,
        y3 = this.p3.y;

    // Lerp control points.
    var x01 = x0 + t * ( x1 - x0 ),
        y01 = y0 + t * ( y1 - y0 );

    var x12 = x1 + t * ( x2 - x1 ),
        y12 = y1 + t * ( y2 - y1 );

    var x23 = x2 + t * ( x3 - x2 ),
        y23 = y2 + t * ( y3 - y2 );

    // Second iteration.
    var x012 = x01 + t * ( x12 - x01 ),
        y012 = y01 + t * ( y12 - y01 );

    var x123 = x12 + t * ( x23 - x12 ),
        y123 = y12 + t * ( y23 - y12 );

    // Final iteration.
    var x0123 = x012 + t * ( x123 - x012 ),
        y0123 = y012 + t * ( y123 - y012 );

    return [
      // First curve, from 0 to t.
      [ x0, y0, x01, y01, x012, y012, x0123, y0123 ],
      // Second curve, from t to 1.
      [ x0123, y0123, x123, y123, x23, y23, x3, y3 ]
    ];
  };

  BezierCurve.prototype.toArray = function() {
    return [
      this.p0.x, this.p0.y,
      this.p1.x, this.p1.y,
      this.p2.x, this.p2.y,
      this.p3.x, this.p3.y
    ];
  };

  BezierCurve.fromArray = function() {
    /* jshint supernew:true */
    return new (Function.prototype.bind.apply( BezierCurve, arguments ));
    /* jshint supernew:false */
  };

  // Define public getters and setters for individual coordinates.
  // Favors convenience over speed.
  [ 'p0', 'p1', 'p2', 'p3' ].forEach(function( point, index ) {
    [ 'x', 'y' ].forEach(function( axis ) {
      var prop = axis + index;

      Object.defineProperty( BezierCurve.prototype, prop, {
        get: function() {
          return this[ point ][ axis ];
        },

        set: function( value ) {
          this[ point ][ axis ] = value;
          return value;
        }
      });
    });
  });

  return BezierCurve;

}) ();
