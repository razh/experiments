/*exported Fabrik*/
var Fabrik = (function() {
  'use strict';

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
  };

  return Fabrik;

}) ();
