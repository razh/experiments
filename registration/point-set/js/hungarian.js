/*exported Hungarian*/
var Hungarian = (function() {
  'use strict';

  /**
   * An implementation of the Hungarian (Kuhn-Munkres) algorithm for solving
   * the assignment problem (modified for rectangular matrices).
   *
   * Translation to JavaScript from the C# implementation found at:
   *
   *   csclab.murraystate.edu/bob.pilgrim/445/munkres.html
   *
   * Comments are sourced from the referenced implementation.
   *
   * Referenced papers:
   *   - Algorithms for Assignment and Transportation Problems.
   *       James Munkres.
   *       Journal of the Society for Industrial and Applied Mathematics.
   *       Volume 5, Number 1, March, 1957.
   *
   *   - An extension of the Munkres algorithm for the assignment problem to
   *     rectangular matrices.
   *       F. Burgeois and J.-C. Lasalle.
   *       Communications of the ACM.
   *       142302-806, 1971.
   */

  var Type = {
    NONE:  0,
    STAR:  1,
    PRIME: 2
  };

  /**
   * Array minima mutation functions.
   */
  function subtractRowMinima( row ) {
    var min = Math.min.apply( Math, row );

    for ( var i = 0, il = row.length; i < il; i++ ) {
      row[i] -= min;
    }

    return row;
  }

  function subtractRowsMinima( array ) {
    for ( var i = 0, il = array.length; i < il; i++ ) {
      subtractRowMinima( array[i] );
    }

    return array;
  }

  function logMatrix( matrix, precision ) {
    precision = precision || 0;

    // Get number of integer digits.
    var maxDigits = 0;
    var digits;
    var i, il;
    var j, jl;
    for ( i = 0, il = matrix.length; i < il; i++ ) {
      for ( j = 0, jl = matrix[i].length; j < jl; j++ ) {
        digits = Math.floor( matrix[i][j] ).toString().length;
        if ( digits > maxDigits ) {
          maxDigits = digits;
        }
      }
    }

    /**
     * Pads an number with leading spaces.
     *
     * For example: pad( 3.24, 3 ) => '  3.24'.
     */
    function pad( number, digits ) {
      var count = digits - Math.floor( number ).toString().length;
      var padding = '';

      while ( count > 0 ) {
        padding += ' ';
        count--;
      }

      return padding + number;
    }

    // Construct string representation of matrix.
    var string = '';
    for ( i = 0, il = matrix.length; i < il; i++ ) {
      for ( j = 0, jl = matrix[i].length; j < jl; j++ ) {
        string += pad( matrix[i][j].toFixed( precision ), maxDigits );

        // Append a comma if not at end.
        if ( j < jl - 1) {
          string += ', ';
        }
      }

      if ( i < il - 1 ) {
        string += '\n';
      }
    }

    return string;
  }

  function logMarks( marks ) {
    var string = '';
    var i, il;
    var j, jl;
    for ( i = 0, il = marks.length; i < il; i++ ) {
      for ( j = 0, jl = marks[i].length; j < jl; j++ ) {
        switch ( marks[i][j] ) {
          case Type.STAR:
            string += '*';
            break;

          case Type.PRIME:
            string += 'P';
            break;

          default:
            string += ' ';
        }

        if ( j < jl - 1 ) {
          string += ', ';
        }
      }

      if ( i < il - 1 ) {
        string += '\n';
      }
    }

    return string;
  }

  function cloneMatrix( matrix ) {
    var clone = [];

    for ( var i = 0, il = matrix.length; i < il; i++ ) {
      clone.push( matrix[i].slice() );
    }

    return clone;
  }

  function cost( costMatrix, indices ) {
    return indices.reduce(function( sum, col, row ) {
      return sum + costMatrix[ row ][ col ];
    }, 0 );
  }

  function calculate( costMatrix ) {
    var coveredRows = [],
        coveredCols = [];

    var marks = [];

    function init() {
      var i, il;
      var j, jl;
      var array;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        array = [];

        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          array.push( 0 );
        }

        marks.push( array );
      }

      step1();
    }

    init();


    /**
     * For each row of the cost matrix, find the smallest element and subtract
     * it from every element in its row. When finished, Go to Step 2.
     */
    function step1() {
      subtractRowsMinima( costMatrix );
      step2();
    }


    function clearCovers() {
      coveredRows = [];
      coveredCols = [];
    }

    /**
     * Find a zero (Z) in the resulting matrix. If there is no starred
     * zero in its row or column, star Z. Repeat for each element in the
     * matrix. Go to Step 3.
     */
    function step2() {
      var i, il;
      var j, jl;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          // Mark uncovered zeros.
          if ( !costMatrix[i][j] && !coveredRows[i] && !coveredCols[j] ) {
            marks[i][j] = Type.STAR;
            coveredRows[i] = true;
            coveredCols[j] = true;
          }
        }
      }

      clearCovers();
      step3();
    }

    /**
     * Cover each column containing a starred zero. If K columns are covered,
     * the starred zeros describe a complete set of unique assignments. In this
     * case, Go to DONE, otherwise, Go to Step 4.
     */
    function step3() {
      var i, il;
      var j, jl;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          if ( marks[i][j] === Type.STAR ) {
            coveredCols[j] = true;
          }
        }
      }

      // Count covered columns.
      var count = 0;
      for ( i = 0, il = coveredCols.length; i < il; i++ ) {
        if ( coveredCols[i] ) {
          count++;
        }
      }

      if ( count >= costMatrix[0].length ) {
        // Finished.
        return;
      } else {
        step4();
      }
    }

    /**
     * Step 4 helper functions.
     */
    function uncoveredZero() {
      var i, il;
      var j, jl;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          if ( !costMatrix[i][j] && !coveredRows[i] && !coveredCols[j] ) {
            return {
              row: i,
              col: j
            };
          }
        }
      }

      return {
        row: -1,
        col: -1
      };
    }

    function indexOfStarRow( row ) {
      for ( var i = 0, il = row.length; i < il; i++ ) {
        if ( row[i] === Type.STAR ) {
          return i;
        }
      }

      return -1;
    }

    /**
     * Find a noncovered zero and prime it. If there is no starred zero
     * in the row containing this primed zero, Go to Step 5. Otherwise,
     * cover this row and uncover the column containing the starred zero.
     * Continue in this manner until there are no uncovered zeros left.
     * Save the smallest uncovered value and Go to Step 6.
     */
    function step4() {
      var row;
      var col;
      var index;
      var starIndex;
      while ( true ) {
        index = uncoveredZero();
        row = index.row;
        col = index.col;

        if ( row === -1 ) {
          return step6();
        } else {
          marks[ row ][ col ] = Type.PRIME;

          starIndex = indexOfStarRow( marks[ row ] );
          if ( starIndex > -1 ) {
            col = starIndex;
            coveredRows[ row ] = true;
            coveredCols[ col ] = false;
          } else {
            return step5( row, col );
          }
        }
      }
    }

    /**
     * Step 5 helper functions.
     */
    function indexOfStarCol( colIndex ) {
      for ( var i = 0, il = marks.length; i < il; i++ ) {
        if ( marks[i][ colIndex ] === Type.STAR ) {
          return i;
        }
      }

      return -1;
    }

    function indexOfPrimeRow( rowIndex ) {
      var row = marks[ rowIndex ];
      for ( var i = 0, il = row.length; i < il; i++ ) {
        if ( row[i] === Type.PRIME ) {
          return i;
        }
      }

      return -1;
    }

    function augmentPath( path, pathCount ) {
      var row, col;
      for ( var i = 0; i < pathCount; i++ ) {
        row = path[i][0];
        col = path[i][1];
        if ( marks[ row ][ col ] === Type.STAR ) {
          marks[ row ][ col ] = 0;
        } else {
          marks[ row ][ col ] = Type.STAR;
        }
      }
    }

    function removePrimes() {
      var i, il;
      var j, jl;
      for ( i = 0, il = marks.length; i < il; i++ ) {
        for ( j = 0, jl = marks[i].length; j < jl; j++ ) {
          if ( marks[i][j] === Type.PRIME ) {
            marks[i][j] = 0;
          }
        }
      }
    }


    /**
     * Construct a series of alternating primed and starred zeros as follows.
     * Let Z0 represent the uncovered primed zero found in Step 4. Let Z1 denote
     * the starred zero in the column of Z0 (if any). Let Z2 denote the primed zero
     * in the row of Z1 (there will always be one). Continue until the series
     * terminates at a primed zero that has no starred zero in its column.
     * Unstar each starred zero of the series, star each primed zero of the series,
     * erase all primes and uncover every line in the matrix. Return to Step 3.
     */
    function step5( row, col ) {
      var pathIndex = 0;
      var path = [
        [ row, col ]
      ];

      var index;
      while ( true ) {
        index = indexOfStarCol( path[ pathIndex ][1] );
        if ( index > -1 ) {
          pathIndex++;
          path[ pathIndex ] = [
            index,
            path[ pathIndex - 1 ][1]
          ];

          index = indexOfPrimeRow( path[ pathIndex ][0] );
          pathIndex++;
          path[ pathIndex ] = [
            path[ pathIndex - 1 ][0],
            index
          ];
        } else {
          break;
        }
      }

      augmentPath( path, pathIndex + 1 );
      clearCovers();
      removePrimes();
      step3();
    }

    /**
     * Step 6 helper function.
     */
    function uncoveredMinima() {
      var min = Number.POSITIVE_INFINITY;

      var value;
      var i, il;
      var j, jl;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          value = costMatrix[i][j];
          if ( value < min && !coveredRows[i] && !coveredCols[j] ) {
            min = value;
          }
        }
      }

      return min;
    }

    /**
     * Add the value found in Step 4 to every element of each covered row, and subtract
     * it from every element of each uncovered column. Return to Step 4 without
     * altering any stars, primes, or covered lines.
     */
    function step6() {
      var min = uncoveredMinima();
      if ( !isFinite( min ) ) {
        return;
      }

      var i, il;
      var j, jl;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          // Add min to every element of each covered row.
          if ( coveredRows[i] ) {
            costMatrix[i][j] += min;
          }

          // Subtract min from every element of each uncoverd column.
          if ( !coveredCols[j] ) {
            costMatrix[i][j] -= min;
          }
        }
      }

      step4();
    }

    return marks.map(function( row ) {
      return row.indexOf( Type.STAR );
    });
  }

  return {
    calculate: calculate,
    cost: cost,

    Matrix: {
      clone: cloneMatrix,
      log: logMatrix
    }
  };

}) ();
