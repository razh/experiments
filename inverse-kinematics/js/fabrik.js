/*exported Fabrik*/
var Fabrik = (function() {
  'use strict';

  /**
   * Forward And Backward Reaching Inverse Kinematics.
   */
  function Fabrik( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
  }

  return Fabrik;

}) ();
