/*globals define*/
define([
  'math/point'
], function( Point ) {
  'use strict';

  function Block( x, y, size ) {
    Point.call( this, x, y );
    this.size = size || 0;
  }

  Block.prototype = new Point();
  Block.prototype.constructor = Block;

  return Block;
});
