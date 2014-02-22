/*exported simplify*/
/**
 * Based upon Mike Bostock's Line Simplification:
 *
 *  http://bost.ocks.org/mike/simplify/
 */
var simplify = (function() {
  'use strict';

  // Binary minheap.
  function MinHeap() {
    this.array = [];
  }

  MinHeap.prototype.push = function() {

  };

  MinHeap.prototype.pop = function() {

  };

  MinHeap.prototype.up = function() {

  };

  MinHeap.prototype.down = function() {

  };

  MinHeap.prototype.parent = function( index ) {
    return Math.floor( 0.5 * index );
  };

  MinHeap.prototype.left = function( index ) {
    return 2 * index;
  };

  MinHeap.prototype.right = function( index ) {
    return 2 * index + 1;
  };

  return function() {

  };
}) ();
