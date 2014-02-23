/*exported simplify*/
/**
 * Based upon Mike Bostock's Line Simplification:
 *
 *  http://bost.ocks.org/mike/simplify/
 */
var simplify = (function() {
  'use strict';

  var compare = function() {};

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

    var min = array[0];
    array.pop();

    if ( array.length ) {
      array[0] = array[ array.length - 1 ];
      this.down(0);
    }

    return min;
  };

  MinHeap.prototype.down = function( index ) {
    var array = this.array,
        length = array.length;

    var min;
    var left, right;
    var temp;

    while ( true ) {
      min = index;
      left = this.left( index );
      right = this.right( index );

      if ( left < length && compare( array[ left ], array[ index ] ) < 0 ) {
        min = left;
      }

      if ( right < length && compare( array[ right ], array[ min ] ) < 0 ) {
        min = right;
      }

      if ( min === index ) {
        break;
      }

      // Swap min and this.
      temp = array[ min ];
      array[ min ] = array[ index ];
      array[ index ] = temp;
    }
  };

  MinHeap.prototype.up = function( index ) {
    var array = this.array;

    var parent;
    var temp;
    while ( index > 0 ) {
      parent = this.parent( index );
      if ( compare( array[ parent ], array[index ] ) >= 0 )  {
        break;
      }

      // Swap parent and this.
      temp = array[ index ];
      array[ index ] = array[ parent ];
      array[ parent ] = temp;

      // Move up the tree.
      index = parent;
    }
  };

  MinHeap.prototype.parent = function( index ) {
    return Math.floor( 0.5 * index ) - 1;
  };

  MinHeap.prototype.left = function( index ) {
    return 2 * index + 1;
  };

  MinHeap.prototype.right = function( index ) {
    return 2 * index + 2;
  };

  return function() {

  };
}) ();
