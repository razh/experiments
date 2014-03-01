/*exported simplify*/
/**
 * Based upon Mike Bostock's Line Simplification:
 *
 *  http://bost.ocks.org/mike/simplify/
 *
 * Almost all of this code is copied from the example.
 */
var simplify = (function() {
  'use strict';

  function minHeap( compareFn ) {
    compareFn = compareFn || function( a, b ) {
      return a - b;
    };

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

        if ( left < length && compare( left, min ) < 0 ) {
          min = left;
        }

        if ( right < length && compare( right, min ) < 0 ) {
          min = right;
        }

        if ( min === index ) {
          break;
        }

        swap( min, index );

        index = min;
      }
    }

    heap.push = function() {
      for ( var i = 0, il = arguments.length; i < il; i++ ) {
        up( array.push( arguments[i] ) - 1 );
      }

      return array.length;
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

        // Use compareFn instead because these are objects, not indices.
        if ( compareFn( object, removed ) < 0 ) {
          up( index );
        } else {
          down( index );
        }
      }

      return index;
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

  return function( points ) {
    var heap = minHeap(function( a, b ) {
      return a[1].area - b[1].area;
    });

    var triangles = [];

    // Build triangles.
    var triangle;
    var i, il;
    for ( i = 0, il = points.length - 2; i < il; i++ ) {
      triangle = [
        points[ i ],
        points[ i + 1 ],
        points[ i + 2 ]
      ];

      triangle[1].area = area( triangle );

      // Add non-degenerate triangles.
      if ( triangle[1].area ) {
        triangles.push( triangle );
        heap.push( triangle );
      }
    }

    // Construct linked list.
    for ( i = 0, il = triangles.length; i < il; i++ ) {
      triangle = triangles[i];
      triangle.previous = triangles[ i - 1 ];
      triangle.next = triangles[ i + 1 ];
    }

    function update( triangle ) {
      heap.remove( triangle );
      triangle[1].area = area( triangle );
      heap.push( triangle );
    }

    var maxArea = 0;
    triangle = heap.pop();
    while ( triangle ) {
      if ( triangle[1].area < maxArea ) {
        triangle[1].area = maxArea;
      } else {
        maxArea = triangle[1].area;
      }

      if ( triangle.previous ) {
        triangle.previous.next = triangle.next;
        triangle.previous[2] = triangle[2];
        update( triangle.previous );
      } else {
        triangle[0].area = triangle[1].area;
      }

      if ( triangle.next ) {
        triangle.next.previous = triangle.previous;
        triangle.next[0] = triangle[0];
        update( triangle.next );
      } else {
        triangle[2].area = triangle[1].area;
      }

      triangle = heap.pop();
    }

    return points;
  };
}) ();
