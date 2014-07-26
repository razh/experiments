/*exported Geometry*/
var Geometry = (function() {
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

  return {
    PI2: PI2,

    distanceSquared: distanceSquared,
    distance: distance
  };

}) ();

