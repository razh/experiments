/*globals define*/
define(function() {
  'use strict';

  var PI2 = 2 * Math.PI;

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function distance( x0, y0, x1, y1 ) {
    return Math.sqrt( distanceSquared( x0, y0, x1, y1 ) );
  }

  /**
   * Returns the angle that a character at (x0, y0) would need to travel along
   * to reach (x1, y1);
   */
  function angleTo( x0, y0, x1, y1 ) {
    return Math.atan2( y1 - y0, x1 - x0 );
  }

  function randomInt( min, max ) {
    return Math.round( min + Math.random() * ( max - min ) );
  }

  function aabb( array ) {
    var x0 = Number.POSITIVE_INFINITY,
        y0 = Number.POSITIVE_INFINITY,
        x1 = Number.NEGATIVE_INFINITY,
        y1 = Number.NEGATIVE_INFINITY;

    var x, y;
    array.forEach(function( element ) {
      x = element.x;
      y = element.y;

      if ( x < x0 ) {
        x0 = x;
      }

      if ( x > x1 ) {
        x1 = x;
      }

      if ( y < y0 ) {
        y0 = y;
      }

      if ( y > y1 ) {
        y1 = y;
      }
    });

    return {
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1
    };
  }

  return {
    distanceSquared: distanceSquared,
    distance:        distance,
    aabb:            aabb,

    PI2:     PI2,
    angleTo: angleTo,

    randomInt: randomInt
  };
});
