/*exported Geometry*/
var Geometry = (function() {
  'use strict';

  var PI2 = 2 * Math.PI;

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function inverseLerp( value, a, b ) {
    return ( value - a ) / ( b - a );
  }

  /**
   * Maps value from [a, b ] to [c, d].
   */
  function mapInterval( a, b, c, d, value ) {
    return lerp( c, d, inverseLerp( value, a, b ) );
  }

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  function lineIntersectionParameter( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var det = ( x1 - x0 ) * ( y3 - y2 ) - ( x3 - x2 ) * ( y1 - y0 );
    if ( !det ) {
      return null;
    }

    return ( ( x3 - x2 ) * ( y0 - y2 ) - ( y3 - y2 ) * ( x0 - x2 ) ) / det;
  }

  function lineIntersection( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var t = lineIntersectionParameter( x0, y0, x1, y1, x2, y2, x3, y3 );
    if ( t === null ) {
      return null;
    }

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

  /**
   * Finds the enclosing bounding box for an array of walls, where
   * each wall is a line segment (x0, y0) - (x1, y1) represented as the
   * flat array: [x0, y0, x1, y1].
   */
  function wallsAABB( walls ) {
    var xmin = Number.POSITIVE_INFINITY,
        ymin = Number.POSITIVE_INFINITY,
        xmax = Number.NEGATIVE_INFINITY,
        ymax = Number.NEGATIVE_INFINITY;

    var wall;
    for ( var i = 0, il = walls.length; i < il; i++ ) {
      wall = walls[i];

      if ( wall[0] < xmin ) { xmin = wall[0]; }
      if ( wall[0] > xmax ) { xmax = wall[0]; }

      if ( wall[1] < ymin ) { ymin = wall[1]; }
      if ( wall[1] > ymax ) { ymax = wall[1]; }

      if ( wall[2] < xmin ) { xmin = wall[2]; }
      if ( wall[2] > xmax ) { xmax = wall[2]; }

      if ( wall[3] < ymin ) { ymin = wall[3]; }
      if ( wall[3] > ymax ) { ymax = wall[3]; }
    }

    return {
      xmin: xmin,
      ymin: ymin,
      xmax: xmax,
      ymax: ymax
    };
  }

  return {
    PI2: PI2,

    lerp: lerp,
    inverseLerp: inverseLerp,
    mapInterval: mapInterval,
    clamp: clamp,

    lineIntersectionParameter: lineIntersectionParameter,
    lineIntersection: lineIntersection,

    distanceSquared: distanceSquared,
    distance: distance,

    wallsAABB: wallsAABB
  };
}) ();
