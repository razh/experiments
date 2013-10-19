/*globals define*/
define(function() {
  'use strict';

  var PI2 = 2 * Math.PI;

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function limit( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  function lineLineIntersection( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var det = ( x1 - x0 ) * ( y3 - y2 ) - ( x3 - x2 ) * ( y1 - y0 );
    if ( det === 0 ) {
      return null;
    }

    var t = ( ( x3 - x2 ) * ( y0 - y2 ) - ( y3 - y2 ) * ( x0 - x2 ) ) / det;
    return lineParameter( x0, y0, x1, y1, t );
  }

  function lineParameter( x0, y0, x1, y1, parameter ) {
    return {
      x: lerp( x0, x1, parameter ),
      y: lerp( y0, y1, parameter )
    };
  }

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function distance( x0, y0, x1, y1 ) {
    return Math.sqrt( distanceSquared( x0, y0, x1, y1 ) );
  }

  return {
    PI2: PI2,
    lerp: lerp,
    limit: limit,
    lineLineIntersection: lineLineIntersection,

    distanceSquared: distanceSquared,
    distance: distance
  };
});
