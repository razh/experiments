define([
  'math/geometry'
], function( Geometry ) {
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

  return Point;
});
