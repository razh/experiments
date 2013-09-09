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

  Segment.prototype.leftOf = function( point ) {
    var x = point.x,
        y = point.y;

    var x0 = this.start.x,
        y0 = this.start.y,
        x1 = this.end.x,
        y1 = this.end.y;

    return ( ( x - x0 ) * ( y1 - y0 ) - ( y - y0 ) * ( x1 - x0 ) ) > 0;
  };

  Segment.prototype.frontOf = function( segment, relativePoint ) {
    // Have an A1 day!
    var a0 = this.leftOf( segment.start.lerp( segment.end, 0.01 ) ),
        a1 = this.leftOf( segment.end.lerp( segment.start, 0.01 ) ),
        a2 = this.leftOf( relativePoint ),
        b0 = segment.leftOf( this.start.lerp( this.end, 0.01 ) ),
        b1 = segment.leftOf( this.end.lerp( this.start, 0.01 ) ),
        b2 = segment.leftOf( relativePoint );

    if ( b0 === b1 && b1 !== b2 ) { return true; }
    if ( a0 === a1 && a1 === a2 ) { return true; }
    if ( a0 === a1 && a1 !== a2 ) { return false; }
    if ( b0 === b1 && b1 === b2 ) { return false; }

    return false;
  };

  Segment.prototype.distanceSquaredTo = function( x, y ) {
    var dx = 0.5 * ( this.start.x + this.end.x ) - x,
        dy = 0.5 * ( this.start.y + this.end.y ) - y;

    return dx * dx + dy * dy;
  };

  return Segment;
});
