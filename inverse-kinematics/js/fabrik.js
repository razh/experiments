/*globals IK*/
/*exported Fabrik*/
var Fabrik = (function() {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  /**
   * Forward And Backward Reaching Inverse Kinematics.
   */
  function Fabrik( x, y ) {
    // Origin.
    this.x = x || 0;
    this.y = y || 0;

    // End effector position.
    this.xf = 0;
    this.yf = 0;

    this.length = 0;
  }

  Fabrik.prototype.set = function( x, y ) {
    x -= this.x;
    y -= this.y;

    // Distances.
    var distance = Math.sqrt( x * x + y * y );
    var dx, dy;
    var di;

    // Parameter.
    var t;

    var count = this.lengths.length;
    var link;
    var next;
    var i;
    if ( distance > IK.length( this ) ) {
      // Not reachable.
      for ( i = 0; i < count; i++ ) {
        link = IK.links[i];

        // Distance from link to point.
        dx = x - link.x;
        dy = y - link.y;

        di = Math.sqrt( dx * dx + dy * dy );
        t = link.length / di;

        next.x = lerp( link.x, x, t );
        next.y = lerp( link.y, y, t );
      }
    } else {
      // Reachable.
    }
  };

  return Fabrik;

}) ();
