/*jshint bitwise: false*/
/*globals define*/
define(function() {
  'use strict';

  /*
   * Taken from:
   * http://gamedev.tutsplus.com/tutorials/implementation/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space/
   * and toxiclibs' implementation of quadtrees, specifically the PointQuadtree.
   */
  function Quadtree( depth, aabb ) {
    this.depth = depth || 0;

    this.objects = [];
    this.nodes = [];

    this.aabb = aabb || {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0
    };
  }

  Quadtree.MAX_OBJECTS = 10;
  Quadtree.MAX_DEPTH = 5;

  Quadtree.prototype.clear = function() {
    this.objects = [];
    this.nodes = [];
  };

  Quadtree.prototype.split = function() {
    var x0 = this.aabb.x0,
        y0 = this.aabb.y0,
        x1 = this.aabb.x1,
        y1 = this.aabb.y1;

    var mx = x0 + 0.5 * ( x1 - x0 ),
        my = y0 + 0.5 * ( y1 - y0 );

    this.nodes[0] = new Quadtree( this.depth + 1, { x0: mx, y0: y0, x1: x1, y1: my } );
    this.nodes[1] = new Quadtree( this.depth + 1, { x0: x0, y0: y0, x1: mx, y1: my } );
    this.nodes[2] = new Quadtree( this.depth + 1, { x0: x0, y0: my, x1: mx, y1: y1 } );
    this.nodes[3] = new Quadtree( this.depth + 1, { x0: mx, y0: my, x1: x1, y1: y1 } );
  };

  Quadtree.prototype.indexOf = function( object ) {
    var index = -1;

    var mx = 0.5 * ( this.x0 + this.x1 ),
        my = 0.5 * ( this.y0 + this.y1 );

    var top = object.y < my;

    if ( object.x < mx ) {
      index = top ? 1 : 2;
    } else {
      index = top ? 0 : 3;
    }

    return index;
  };

  Quadtree.prototype.insert = function( object ) {
    var index;
    if ( this.nodes[0] ) {
      index = this.indexOf( object );
      if ( index !== -1 ) {
        this.nodes[ index ].insert( object );
        return;
      }
    }

    this.objects.push( object );

    if ( this.objects.size() > Quadtree.MAX_OBJECTS && this.depth < Quadtree.MAX_DEPTH ) {
      if ( !this.nodes[0] ) {
        this.split();
      }

      var i = 0;
      while ( i < this.objects.length ) {
        index = this.indexOf( this.objects[i] );
        if ( index !== -1 ) {
          this.nodes[ index ].insert( this.objects.splice( i, 1 ) );
        } else {
          i++;
        }
      }
    }
  };

  Quadtree.prototype.retrieve = function( object, potentials ) {
    var index = this.indexOf( object );
    if ( index !== -1 && this.nodes[0] ) {
      this.nodes[ index ].retrieve( object, potentials );
    }

    potentials = potentials.concat( this.objects );
    return potentials;
  };


  function QuadtreePoint( x, y, size, parent ) {
    this.x = x || 0;
    this.y = y || 0;

    this.size = size || 0;
    this.halfSize = 0.5 * this.size;

    this.objects = [];
    this.children = [];

    this.depth = 0;
    this.minSize = Quadtree.MIN_SIZE;

    this.parent = parent || null;
    if ( parent ) {
      this.depth = parent.depth + 1;
      this.minSize = parent.minSize;
    }
  }

  QuadtreePoint.MIN_SIZE = 4;

  QuadtreePoint.TOP_LEFT  = 0;
  QuadtreePoint.TOP_RIGHT = 1;
  QuadtreePoint.BOTTOM_LEFT  = 2;
  QuadtreePoint.BOTTOM_RIGHT = 3;

  QuadtreePoint.prototype.insert = function( object ) {
    var x = object.x,
        y = object.y;

    if ( this._contains( x, y ) ) {
      if ( this.halfSize <= Quadtree.MIN_SIZE ) {
        this.objects.push( object );
        return true;
      } else {
        x -= this.x;
        y -= this.y;

        var quadrant = this.quadrantOf( x, y );
        if ( !this.children[ quadrant ] ) {
          this.children[ quadrant ] = new Quadtree(
            this,
            this.x + ( !( quadrant & 1 ) ? this.halfSize : 0 ),
            this.y + ( !( quadrant & 2 ) ? this.halfSize : 0 ),
            this.halfSize
          );
        }

        return this.children[ quadrant ].insert( object );
      }
    }

    return false;
  };

  QuadtreePoint.prototype.contains = function( x, y ) {
    return x - this.halfSize <= this.x && this.x <= x + this.halfSize &&
           y - this.halfSize <= this.y && this.y <= y + this.halfSize;
  };

  /**
   * Get the quadrant index for the point given by (x, y), where x and y are in
   * the local coordinate space.
   */
  QuadtreePoint.prototype.quadrantOf = function( x, y ) {
    return ( x > this.halfSize ? 1 : 0 ) +
           ( y > this.halfSize ? 2 : 0 );
  };

  return QuadtreePoint;
});
