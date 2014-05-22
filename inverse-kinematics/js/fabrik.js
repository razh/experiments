/*exported Fabrik*/
var Fabrik = (function() {
  'use strict';

  function Link( length, angle ) {
    this.length = length || 0;
    this.angle = angle || 0;

    this.x = 0;
    this.y = 0;
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
  };

  Fabrik.prototype.calculate = function() {
    var link;
    var next;
    var dx, dy;
    for ( var i = 0, il = this.links.length; i < il; i++ ) {
      link = this.links[i];
      next = this.links[ i + 1 ];

      dx = link.x + Math.cos( link.angle ) * link.length;
      dy = link.y + Math.sin( link.angle ) * link.length;

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

  Fabrik.prototype.draw = function( ctx ) {
    var x = this.x,
        y = this.y;

    ctx.moveTo( x, y );

    var link;
    for ( var i = 0, il = this.links.length; i < il; i++ ) {
      link = this.links[i];

      x += Math.cos( link.angle ) * link.length;
      y += Math.sin( link.angle ) * link.length;

      ctx.lineTo( x, y );
    }
  };

  Fabrik.prototype.remove = function( link ) {
    var index = this.links.indexOf( link );

    if ( index !== -1 ) {
      this.links.splice( index, 1 );
    }
  };

  /**
   * Generates an initially horizontal system from an array of link/bone
   * lengths.
   */
  Fabrik.prototype.fromArray = function( array ) {
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

  return Fabrik;

}) ();
