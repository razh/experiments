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

    this.EPSILON = 1e-2;
    this.MAX_ITERATIONS = 32;
  }

  Fabrik.prototype.set = function( x, y ) {
    x -= this.x;
    y -= this.y;

    // Distances.
    var distance = Math.sqrt( x * x + y * y );
    var dxi, dyi;
    var dxj, dyj;
    var dxf, dyf;
    var di, dj, df;

    // Parameter.
    var t;

    var count = this.links.length;
    var iterations = 0;
    var link;
    var next;
    var x0, y0;
    var xi, yi;
    var xj, yj;
    var xt, yt;
    var xf, yf;
    var i;
    // Not reachable.
    if ( distance > IK.length( this ) ) {
      for ( i = 0; i < count; i++ ) {
        link = this.links[i];
        next = this.links[ i + 1 ];

        xi = link.x;
        yi = link.y;

        // Distance from link to point.
        dxi = x - xi;
        dyi = y - yi;

        di = Math.sqrt( dxi * dxi + dyi * dyi );

        // Move next link/end effector to desired position.
        t = link.length / di;

        xt = lerp( xi, x, t );
        yt = lerp( yi, y, t );

        if ( next ) {
          next.x = xt;
          next.y = yt;
        } else {
          this.xf = xt;
          this.yf = yt;
        }
      }
    }
    // Reachable.
    else {
      // Initial position of first link.
      link = this.links[0];

      x0 = link.x;
      y0 = link.y;

      // End effector.
      xf = this.xf;
      yf = this.yf;

      // Distance from end effector to point.
      dxf = x - xf;
      dyf = y - yf;

      df = Math.sqrt( dxf * dxf + dyf * dyf );
      while ( df > this.EPSILON && iterations < this.MAX_ITERATIONS ) {
        iterations++;

        // Stage 1: Forward reaching.
        // Set end effector to target.
        xf = x;
        yf = y;

        for ( i = count - 1; i >= 0; i-- ) {
          link = this.links[i];
          next = this.links[ i + 1 ];

          xi = link.x;
          yi = link.y;

          if ( next ) {
            xj = next.x;
            yj = next.y;
          } else {
            xj = xf;
            yj = yf;
          }

          // Distance from link to next link.
          dxj = xj - xi;
          dyj = yj - yi;

          dj = Math.sqrt( dxj * dxj + dyj * dyj );

          // Move next link/end effector to new position.
          t = link.length / dj;

          link.x = lerp( xj, xi, t );
          link.y = lerp( yj, yi, t );
        }

        // Stage 2: Backward reaching.
        // Set first link to initial position.
        link = this.links[0];

        link.x = x0;
        link.y = y0;

        for ( i = 0; i < count; i++ ) {
          link = this.links[i];
          next = this.links[ i + 1 ];

          xi = link.x;
          yi = link.y;

          if ( next ) {
            xj = next.x;
            yj = next.y;
          } else {
            xj = xf;
            yj = yf;
          }

          // Distance from link to next link.
          dxj = xj - xi;
          dyj = yj - yi;

          dj = Math.sqrt( dxj * dxj + dyj * dyj );

          // Move next link/end effector to new position.
          t = link.length / dj;

          xt = lerp( xi, xj, t );
          yt = lerp( yi, yj, t );

          if ( next ) {
            next.x = xt;
            next.y = yt;
          } else {
            xf = xt;
            yf = yt;
          }
        }

        dxf = x - xf;
        dyf = y - yf;

        df = Math.sqrt( dxf * dxf + dyf * dyf );
      }

      this.xf = xf;
      this.yf = yf;
    }
  };

  return Fabrik;

}) ();
