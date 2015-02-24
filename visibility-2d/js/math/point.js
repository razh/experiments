/*global Geometry*/
/*exported Point*/
var Point = (function() {
  'use strict';

  function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Point.prototype.lerp = function( point, alpha ) {
    return new Point(
      Geometry.lerp( this.x, point.x, alpha ),
      Geometry.lerp( this.y, point.y, alpha )
    );
  };

  Point.prototype.angleFrom = function( x, y ) {
    return Math.atan2( this.y - y, this.x - x );
  };

  Point.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  };

  return Point;
}) ();
