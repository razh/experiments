/*exported CCD*/
var CCD = (function() {
  'use strict';

  function Link( length, angle ) {
    this.length = length || 0;
    this.angle = angle || 0;

    // Computed values.
    this.x = 0;
    this.y = 0;
  }

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

    this.calculate();

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

  CCD.prototype.calculate = function() {
    var link;
    var next;
    var angle;
    var dx, dy;
    for ( var i = 0, il = this.links.length; i < il; i++ ) {
      link = this.links[i];
      next = this.links[ i + 1 ];

      angle = link.angle;

      dx = link.length;
      dy = 0;

      if ( angle ) {
        dx = Math.cos( angle ) * link.length;
        dy = Math.sin( angle ) * link.length;
      }

      dx += link.x;
      dy += link.y;

      if ( next ) {
        next.x = dx;
        next.y = dy;
      } else {
        // Set end effector position.
        this.xf = dx;
        this.yf = dy;
      }
    }
  };

  CCD.prototype.draw = function( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.moveTo( 0, 0 );

    var link;
    var cos, sin;
    for ( var i = 0, il = this.links.length; i < il; i++ ) {
      link = this.links[i];

      cos = Math.cos( link.angle );
      sin = Math.sin( link.angle );

      ctx.translate( cos * link.length, sin * link.length );
      ctx.lineTo( 0, 0 );
    }

    ctx.restore();
  };

  CCD.prototype.remove = function( link ) {
    var index = this.links.indexOf( link );

    if ( index !== -1 ) {
      this.links.splice( index, 1 );
    }
  };

  /**
   * Generates an initially horizontal system from an array of link/bone
   * lengths.
   */
  CCD.prototype.fromArray = function( array ) {
    this.links = array.reduce(function( links, length, index ) {
      var link = new Link( length );

      // Set initial position of link.
      var prev;
      if ( links.length > 1 ) {
        prev = links[ index - 1 ];
        link.x = prev.x + prev.length;
      }

      links.push( new Link( length ) );
      return links;
    }, [] );

    // Set end effector position.
    var last = this.links[ this.links.length - 1 ];
    this.xf = last.x + last.length;
    this.yf = 0;
  };

  return CCD;

}) ();
