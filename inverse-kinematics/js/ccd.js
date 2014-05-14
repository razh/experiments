/*exported CCD*/
var CCD = (function() {
  'use strict';

  function Effector( length, angle ) {
    this.length = length || 0;
    this.angle = angle || 0;

    // Computed values.
    this.x = this.length;
    this.y = 0;
    this.cos = 1;
    this.sin = 0;
  }

  /**
   * Cyclic coordinate descent in two dimensions.
   */
  function CCD() {
    this.effectors = [];

    this.EPSILON = 1e-5;
    this.MAX_ITERATIONS = 20;
  }

  CCD.prototype.set = function( x, y ) {
    var iterations = 0;
    var distance = Number.POSITIVE_INFINITY;

    var count = this.effectors.length;
    var i;

    var effector;
    var dx, dy;
    while ( iterations > this.MAX_ITERATIONS || distance < this.EPSILON ) {
      for ( i = count - 1; i >= 0; i-- ) {
        effector = this.effectors[i];

        dx = x - effector.x;
        dy = y - effector.y;

        effector.angle = Math.atan2( dy, dx );
      }
    }
  };

  CCD.prototype.add = function( effector ) {
    this.effectors.add( effector );
  };

  CCD.prototype.remove = function( effector ) {
    var index = this.effectors.indexOf( effector );

    if ( index !== -1 ) {
      this.effectors.splice( index, 1 );
    }
  };

  CCD.prototype.fromArray = function( array ) {
    this.effectors = array.reduce(function( length ) {
      array.push( new Effector( length ) );
    }, [] );
  };

  return CCD;

}) ();
