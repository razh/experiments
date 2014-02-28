/*exported simplify*/
/**
 * Based upon Mike Bostock's Line Simplification:
 *
 *  http://bost.ocks.org/mike/simplify/
 */
var simplify = (function() {
  'use strict';

  function minHeap( compareFn ) {
    var heap = {},
        array = [];

    var compare = function( a, b ) {
      return compareFn( array[a], array[b] );
    };

    /**
     * Swap elements at indices a and b.
     */
    function swap( a, b ) {
      var temp = array[a];
      array[a] = array[b];
      array[b] = temp;
    }

    function up( index ) {
      var parent;
      while ( index > 0 ) {
        parent = Math.floor( ( index + 1 ) / 2 ) - 1;

        if ( compare( parent, index ) >= 0 ) {
          break;
        }

        swap( parent, index );

        // Move up the tree.
        index = parent;
      }
    }

    function down( index ) {
      var length = array.length;

      var min;
      var left, right;

      while ( true ) {
        right = 2 * ( index + 1 );
        left = right - 1;
        min = index;

        if ( left < length && compare( left, index ) < 0 ) {
          min = left;
        }

        if ( right < length && compare( right, min ) < 0 ) {
          min = right;
        }

        if ( min === index ) {
          break;
        }

        swap( min, index );
      }
    }

    heap.push = function() {
      for ( var i = 0, il = arguments.length; i < il; i++ ) {
        up( array.push( arguments[i] ) - 1 );
      }

      return this.array.length;
    };

    heap.pop = function() {
      var removed = array[0],
          last = array.pop();

      if ( array.length ) {
        array[0] = last;
        down(0);
      }

      return removed;
    };

    heap.remove = function( removed ) {
      var index = array.indexOf( removed ),
          object = array.pop();

      if ( index !== -1 && index !== array.length ) {
        array[ index ] = object;

        if ( compare( object, removed ) < 0 ) {
          up( index );
        } else {
          down( index );
        }
      }
    };

    return heap;
  }

  /**
   * Returns the area of the quadrilateral (cross-product).
   */
  function area( t ) {
    return Math.abs(
     ( t[1].x - t[0].x ) * ( t[2].y - t[0].y ) -
     ( t[2].x - t[0].x ) * ( t[1].y - t[0].y )
    );
  }

  return function() {

  };
}) ();
