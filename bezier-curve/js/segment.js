/*globals Endpoint*/
/*exported Segment*/
var Segment = (function() {
  'use strict';

  function Segment() {
    var x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0;

    // Set from existing endpoints.
    if ( arguments.length === 2 ) {
      this.p0 = arguments[0];
      this.p1 = arguments[1];
      return this;
    }

    // Set endpoints.
    if ( arguments.length === 4 ) {
      x0 = arguments[0];
      y0 = arguments[1];
      x1 = arguments[2];
      y1 = arguments[3];
    }

    this.p0 = new Endpoint( x0, y0 );
    this.p1 = new Endpoint( x1, y1 );
  }

  Segment.prototype.draw = function( ctx ) {
    ctx.moveTo( this.p0.x, this.p0.y );
    ctx.lineTo( this.p1.x, this.p1.y );
  };

  Segment.prototype.first = function() {
    return this.p0;
  };

  Segment.prototype.last = function() {
    return this.p1;
  };

  Segment.prototype.points = function() {
    return [ this.p0, this.p1 ];
  };

  Segment.prototype.linkTo = function( segment ) {
    this.p0 = segment.last();
    return this;
  };

  Segment.prototype.unlink = function() {
    this.p0 = this.p0.clone();
    return this;
  };

  return Segment;

}) ();
