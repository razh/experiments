/*globals define*/
define([
  'math/point'
], function( Point ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  function lerp( a, b, t ) {
    return a + t * ( b - a );
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
    return new Point( lerp( x0, x1, parameter ), lerp( y0, y1, parameter ) );
  }

  return {
    PI2: PI2,
    lerp: lerp,
    lineLineIntersection: lineLineIntersection
  };
});
