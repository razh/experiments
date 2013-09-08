'use strict';

/**
 * This Quadtree implementation is heavily derived from toxiclibs'
 * PointQuadtree class.
 */
function Quadtree( x, y, size, parent ) {
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

Quadtree.MIN_SIZE = 4;

Quadtree.TOP_LEFT  = 0;
Quadtree.TOP_RIGHT = 1;
Quadtree.BOTTOM_LEFT  = 2;
Quadtree.BOTTOM_RIGHT = 3;

Quadtree.prototype.clear = function() {
  this.objects = [];

  this.children.forEach(function( child ) {
    child.parent = null;
  });

  this.children = [];
};

Quadtree.prototype.insert = function( object ) {
  var x = object.x,
      y = object.y;

  if ( this.contains( x, y ) ) {
    if ( this.halfSize <= Quadtree.MIN_SIZE ) {
      this.objects.push( object );
      return true;
    } else {
      x -= this.x;
      y -= this.y;

      var quadrant = this.quadrantOf( x, y );
      if ( !this.children[ quadrant ] ) {
        this.children[ quadrant ] = new Quadtree(
          this.x + ( ( quadrant & 1 ) ? this.halfSize : 0 ),
          this.y + ( ( quadrant & 2 ) ? this.halfSize : 0 ),
          this.halfSize,
          this
        );
      }

      return this.children[ quadrant ].insert( object );
    }
  }

  return false;
};

Quadtree.prototype.insertAll = function( array ) {
  array.forEach(function( element ) {
    this.insert( element );
  }.bind( this ));
};

Quadtree.prototype.contains = function( x, y ) {
  return this.x <= x && x < this.x + this.size &&
         this.y <= y && y < this.y + this.size;
};

/**
 * Get the quadrant index for the point given by (x, y), where x and y are in
 * the local coordinate space.
 */
Quadtree.prototype.quadrantOf = function( x, y ) {
  return ( x > this.halfSize ? 1 : 0 ) +
         ( y > this.halfSize ? 2 : 0 );
};

Quadtree.prototype.intersects = function( x, y, width, height ) {
  return !( this.x + this.width  < x || x + width  < this.x ||
            this.y + this.height < y || y + height < this.y );
};

Quadtree.prototype.retrieve = function( x, y, width, height ) {
  var results = [];

  if ( this.intersects( x, y, width, height ) ) {
    this.objects.forEach(function( object ) {
      if ( x <= object.x && object.x <= x + width &&
           y <= object.y && object.y <= y + height ) {
        results.push( object );
      }
    });
  } else if ( this.children.length ) {
    this.children.forEach(function( child ) {
      if ( !child ) {
        return;
      }

      results = results.concat( child.retrieve( x, y, width, height ) );
    });
  }

  return results;
};
