/*globals define*/
define([
  'math/point'
], function( Point ) {
  'use strict';

  function Segment( start, end, distanceSquared ) {
    this.start = start || new Point();
    this.end = end || new Point();
    this.distanceSquared = distanceSquared || 0;
  }

  Segment.prototype.draw = function( ctx ) {
    ctx.moveTo( this.start.x, this.start.y );
    ctx.lineTo( this.end.x, this.end.y );
  };

  Segment.prototype.leftOf = function( x, y ) {
    var x0 = this.start.x,
        y0 = this.start.y,
        x1 = this.end.x,
        y1 = this.end.y;

    return ( ( x - x0 ) * ( y1 - y0 ) - ( y - y0 ) * ( x1 - x0 ) ) > 0;
  };

  Segment.prototype.frontOf = function( segment, relativePoint ) {
    var start = this.start,
        end = this.end;
    // Have an A1 day!
    var a1 = this.leftOf( segment, start.lerp( end, 0.01 ) );
  };

  Segment.prototype.distanceSquaredTo = function( x, y ) {
    var dx = 0.5 * ( this.start.x + this.end.x ) - x,
        dy = 0.5 * ( this.start.y + this.end.y ) - y;

    return dx * dx + dy * dy;
  };

  return Segment;
});
