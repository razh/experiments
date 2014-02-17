'use strict';

/**
 * Should the grid be divided by cell size or cell count?
 */
function SpatialGrid( x, y, width, height, count ) {
  this.x = x || 0;
  this.y = y || 0;

  this.width  = width  || 0;
  this.height = height || 0;

  this.count = count || 1;

  this.spacing = {
    x: this.width  / this.count,
    y: this.height / this.count
  };

  this.grid = [];
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

  if ( this.contains( x, y ) ) {
    // TODO: Implementation.
    return true;
  }

  return false;
};

SpatialGrid.prototype.insertAll = function( array ) {
  array.forEach(function( element ) {
    this.insert( element );
  }.bind( this ));
};

SpatialGrid.prototype.xIndexOf = function( x ) {
  return Math.floor( x / this.spacing.x );
};

SpatialGrid.prototype.yIndexOf = function( y ) {
  return Math.floor( y / this.spacing.y );
};

SpatialGrid.prototype.indexOf = function( x, y ) {
  return this.yIndexOf( y ) * this.count + this.xIndexOf( x );
};

SpatialGrid.prototype.contains = function( x, y ) {
  return this.x <= x && x <= this.x + this.width &&
         this.y <= y && y <= this.y + this.height;
};

SpatialGrid.prototype.retrieve = function( x, y, width, height ) {
  // TODO: Implementation.
  return {
    x: x,
    y: y,
    width: width,
    height: height
  };
};
