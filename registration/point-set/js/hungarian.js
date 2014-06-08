/*exported Hungarian*/
var Hungarian = (function() {
  'use strict';

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
    var i, il;
    for ( i = 0, il = array.length; i < il; i++ ) {
      subtractRowMinima( array[i] );
    }
  }

  /**
   * Takes a two-dimensional n by m matrix.
   */
  function subtractColMinima( array, colIndex ) {
    var min = Number.POSITIVE_INFINITY;
    var value;
    var i, il;
    // Create col array and find min.
    for ( i = 0, il = array.length; i < il; i++ ) {
      value = array[i][ colIndex ];
      if ( value < min ) {
        min = value;
      }
    }

    for ( i = 0, il = array.length; i < il; i++ ) {
      array[i][ colIndex ] -= min;
    }

    return array;
  }

  function subtractColsMinima( array ) {
    var i, il;
    for ( i = 0, il = array[0].length; i < il; i++ ) {
      subtractColMinima( array, i );
    }
  }

  function logMatrix( matrix, precision ) {
    var string = '';

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

  function calculate( costMatrix ) {
    var coveredRows = [],
        coveredCols = [];

    var marked = [];

    function init() {
      for ( var i = 0, il = costMatrix[0].length; i < il; i++ ) {
        marked.push( [] );
      }

      step1();
    }

    init();

    function step1() {
      subtractRowsMinima( costMatrix );
      step2();
    }

    function step2() {
      var i, il;
      var j, jl;
      var row;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        row = costMatrix[i];
        for ( j = 0, jl = row.length; j < jl; j++ ) {
          // Mark uncovered zeros.
          if ( !costMatrix && !coveredRows[i] && !coveredCols[j] ) {
            marked[i][j] = true;
            coveredRows[i] = true;
            coveredCols[j] = true;
          }
        }
      }

      // Empty covers.
      coveredRows = [];
      coveredCols = [];
    }

    function step3() {
      var i, il;
      var j, jl;
      // Cover each column containing a starred zero.
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          if ( marked[i][j] === Type.STAR ) {
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

    // Step 4 helper functions.
    function findUncoveredZero( costMatrix, coveredRows, coveredCols ) {
      var row = -1,
          col = -1;

      var i, il;
      var j, jl;
      for ( i = 0, il = costMatrix.length; i < il; i++ ) {
        for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
          if ( !costMatrix[i][j] && !coveredRows[i] && !coveredCols[j] ) {
            // TODO: Out variable these.
            row = i;
            col = j;
            break;
          }
        }
      }

      return {
        row: row,
        col: col
      };
    }

    function isRowStarred( row ) {
      for ( var i = 0, il = row.length; i < il; i++ ) {
        if ( row[i] === Type.STAR ) {
          return true;
        }
      }

      return false;
    }

    function indexOfStar( row ) {
      for ( var i = 0, il = row.length; i < il; i++ ) {
        if ( row[i] === Type.STAR ) {
          return i;
        }
      }

      return -1;
    }

    function step4() {
      var index;
      var starIndex;
      while ( true ) {
        index = findUncoveredZero( costMatrix, coveredRows, coveredCols );
        if ( index.row === -1 ) {
          return step6();
        } else {
          marked[ index.row ][ index.col ] = 2;

          starIndex = indexOfStar( marked, index.row );
          if ( starIndex !== -1 ) {
            coveredRows[ index.row ] = true;
            coveredCols[ index.col ] = false;
          } else {
            return step5( index.row, index.col );
          }
        }
      }
    }

    function step5( row, col ) {
      function indexOfStarCol( costMatrix, col ) {
        for ( var i = 0, il = costMatrix.length; i < il; i++ ) {
          if ( costMatrix[i][ col ] === Type.STAR ) {
            return i;
          }
        }

        return -1;
      }

      function indexOfPrimeRow( row ) {
        for ( var i = 0, il = costMatrix.length; i < il; i++ ) {
          if ( row[i] === Type.PRIME ) {
            return i;
          }
        }

        return -1;
      }

      function augmentPath( marked, path, lastIndex ) {
        var row, col;
        for ( var i = 0; i < lastIndex; i++ ) {
          row = path[i][0];
          col = path[i][1];
          if ( marked[ row ][ col ] === 1 ) {
            marked[ row ][ col ] = 0;
          } else {
            marked[ row ][ col ] = 1;
          }
        }
      }

      function clearCovers() {
        coveredRows = [];
        coveredCols = [];
      }

      function removePrimes( marked ) {
        var i, j;
        for ( i = 0; i < marked.length; i++ ) {
          for ( j = 0; j < marked[i].length; j++ ) {
            if ( marked[i][j] === Type.PRIME ) {
              marked[i][j] = 0;
            }
          }
        }
      }

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

      augmentPath( marked, path, pathIndex );
      clearCovers();
      removePrimes( marked );
      step3();
    }

    function uncoveredMinima( costMatrix, coveredRows, coveredCols ) {
      var min = Number.POSITIVE_INFINITY;

      var value;
      var i, il;
      var j, jl;
      for ( i = 0, i = costMatrix.length; i < il; i++ ) {
        for ( j = 0, j = costMatrix[i].length; j < jl; j++ ) {
          value = costMatrix[i][j];
          if ( value < min && !coveredRows[i] && !coveredCols[j] ) {
            min = value;
          }
        }
      }

      return value;
    }

    function step6() {
      var min = uncoveredMinima( costMatrix, coveredRows, coveredCols );
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

    return;
  }

  return {
    calculate: calculate,

    Matrix: {
      log: logMatrix
    }
  };

}) ();
