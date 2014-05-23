/*exported CCD*/
var CCD = (function() {
  'use strict';

  /**
   * Cyclic coordinate descent in two dimensions.
   */
  function CCD( x, y ) {
    // Origin.
    this.x = x || 0;
    this.y = y || 0;

    // End effector position.
    this.xf = 0;
    this.yf = 0;

    /**
     *  Links consist of a joint angle and length.
     *
     *             o---C
     *           /
     *     o---o
     *
     *  origin
     */
    this.links = [];

    this.EPSILON = 1e-2;
    this.MAX_ITERATIONS = 1;

    this.debug = [];
    this.debugLines = [];
  }

  CCD.prototype.set = function( x, y ) {
    x -= this.x;
    y -= this.y;

    this.debug = [];
    this.debugLines = [];

    var iterations = 0;
    var distance = Number.POSITIVE_INFINITY;

    var xf = this.xf,
        yf = this.yf;

    var i;
    var link;
    var xi, yi;
    var cos, sin;
    var ai, af;
    var da;
    var dxi, dyi;
    var dxf, dyf;
    var rxf, ryf;
    while ( iterations < this.MAX_ITERATIONS ) {
      for ( i = this.links.length - 1; i >= 0; i-- ) {
        // Distance from point to end effector.
        dxf = x - xf;
        dyf = y - yf;

        distance = Math.sqrt( dxf * dxf + dyf * dyf );
        if ( distance < this.EPSILON ) {
          return;
        }

        link = this.links[i];

        xi = link.x;
        yi = link.y;

        // Distance from point to current link.
        dxi = x - xi;
        dyi = y - yi;

        // Distance from end effector to current link.
        dxf = xf - xi;
        dyf = yf - yi;

        this.debugLines.push([
          xi + this.x,       yi + this.y,
          xi + this.x + dxi, yi + this.y + dyi
        ]);

        this.debugLines.push([
          xi + this.x,       yi + this.y,
          xi + this.x + dxf, yi + this.y + dyf
        ]);

        // Rotation angle.
        ai = Math.atan2( dyi, dxi );
        af = Math.atan2( dyf, dxf );
        da = ai - af;

        if ( !da ) {
          continue;
        }

        // Rotate end effector about origin of current link.
        cos = Math.cos( da );
        sin = Math.sin( da );

        rxf = cos * dxf - sin * dyf;
        ryf = sin * dxf + cos * dyf;

        dxf = rxf;
        dyf = ryf;

        link.angle += da;

        xf = xi + dxf;
        yf = yi + dyf;
        this.debug.push( [ xf + this.x, yf + this.y ] );
      }

      iterations++;
    }
  };

  return CCD;

}) ();
