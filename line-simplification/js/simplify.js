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
    for ( var i = 0, il = arguments.length; i < il; i++ ) {
      this.up( this.array.push( arguments[i] ) - 1 );
    }

    return this.array.length;
  };

  MinHeap.prototype.pop = function() {
    var array = this.array;

    var min = array[1];
    array[1] = array[ array.length - 1 ];
    array.pop();

    if ( array.length ) {
      this.down(1);
    }

    return min;
  };

  MinHeap.prototype.down = function( index ) {
    var array  = this.array,
        length = array.length - 1;

    var leftIndex  = this.left( index ),
        rightIndex = this.right( index );

    var minIndex = index;

    if ( leftIndex <= length && array[ leftIndex ] > array[ index ] ) {
      minIndex = leftIndex;
    }

    if ( rightIndex <= length && array[ rightIndex ] > array[ minIndex ] ) {
      minIndex = rightIndex;
    }

    var temp;
    if ( minIndex !== index ) {
      // Swap minIndex and this.
      temp = array[ minIndex ];
      array[ minIndex ] = array[ index ];
      array[ index ] = temp;
      this.down( minIndex );
    }
  };

  MinHeap.prototype.up = function( index ) {
    var array  = this.array;

    var parentIndex;
    var temp;
    while( index > 1 ) {
      parentIndex = this.parent( index );
      if ( array[ parentIndex] >= array[index ] )  {
        break;
      }

      //  Swap parent and this.
      temp = array[ index ];
      array[ index ] = array[ parentIndex ];
      array[ parentIndex ] = temp;

      // Move up the tree.
      index = parentIndex;
    }
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
