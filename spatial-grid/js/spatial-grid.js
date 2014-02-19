'use strict';

function clamp( value, min, max ) {
  return Math.min( Math.max( value, min ), max );
}

function SpatialGrid( x, y, width, height, count ) {
  this.x = x || 0;
  this.y = y || 0;

  this.width  = width  || 0;
  this.height = height || 0;

  this.count = count || 1;

  this.cellWidth  = this.width  / this.count;
  this.cellHeight = this.height / this.count;

  this.grid = [];

  this.initialize();
}

SpatialGrid.prototype.initialize = function() {
  var count = this.count * this.count;
  while ( count-- ) {
    this.grid.push( [] );
  }
};

SpatialGrid.prototype.clear = function() {
  this.grid = [];
  this.initialize();
};

SpatialGrid.prototype.insert = function( object ) {
  var x = object.x,
      y = object.y;

  var index;
  if ( this.contains( x, y ) ) {
    index = this.indexOf( x, y );
    return this.grid[ index ].push( object );
  }

  return false;
};

SpatialGrid.prototype.insertAll = function( array ) {
  array.forEach(function( element ) {
    this.insert( element );
  }.bind( this ));
};

SpatialGrid.prototype.xIndexOf = function( x ) {
  return clamp( Math.floor( x / this.cellWidth ), 0, this.count - 1 );
};

SpatialGrid.prototype.yIndexOf = function( y ) {
  return clamp( Math.floor( y / this.cellHeight ), 0, this.count - 1 );
};

SpatialGrid.prototype.indexOf = function( x, y ) {
  return this.yIndexOf( y ) * this.count + this.xIndexOf( x );
};

SpatialGrid.prototype.contains = function( x, y ) {
  return this.x <= x && x <= this.x + this.width &&
         this.y <= y && y <= this.y + this.height;
};

/**
 * Returns an array of cells that intersect the given bounding box.
 */
SpatialGrid.prototype.retrieveCells = function( x, y, width, height ) {
  var xminIndex = this.xIndexOf( x ),
      yminIndex = this.yIndexOf( y ),
      xmaxIndex = this.xIndexOf( x + width ),
      ymaxIndex = this.yIndexOf( y + height );

  var results = [];

  var index;
  var i, j;
  for ( i = yminIndex; i <= ymaxIndex; i++ ) {
    for ( j = xminIndex; j <= xmaxIndex; j++ ) {
      index = i * this.count + j;
      results.push( this.grid[ index ] );
    }
  }

  return results;
};

/**
 * Returns a flat array of potentials in the given bounding box.
 */
SpatialGrid.prototype.retrieve = function( x, y, width, height ) {
  return this.retrieveCells( x, y, width, height )
    .reduce(function( a, b ) {
      return a.concat( b );
    });
};
