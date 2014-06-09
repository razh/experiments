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

    function step1() {
      subtractRowsMinima( costMatrix );
      step2();
    }

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

      // Empty covers.
      coveredRows = [];
      coveredCols = [];

      step3();
    }

    function step3() {
      var i, il;
      var j, jl;
      // Cover each column containing a starred zero.
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

    // Step 4 helper functions.
    function findUncoveredZero() {
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

    function indexOfStar( row ) {
      for ( var i = 0, il = row.length; i < il; i++ ) {
        if ( row[i] === Type.STAR ) {
          return i;
        }
      }

      return -1;
    }

    function step4() {
      var row;
      var col;
      var index;
      var starIndex;
      while ( true ) {
        index = findUncoveredZero();
        row = index.row;
        col = index.col;
        if ( row === -1 ) {
          return step6();
        } else {
          marks[ row ][ col ] = Type.PRIME;

          starIndex = indexOfStar( marks[ row ] );
          if ( starIndex !== -1 ) {
            col = starIndex;
            coveredRows[ row ] = true;
            coveredCols[ col ] = false;
          } else {
            return step5( row, col );
          }
        }
      }
    }

    function step5( row, col ) {
      function indexOfStarCol( col ) {
        for ( var i = 0, il = marks.length; i < il; i++ ) {
          if ( marks[i][ col ] === Type.STAR ) {
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
          if ( marks[ row ][ col ] === 1 ) {
            marks[ row ][ col ] = 0;
          } else {
            marks[ row ][ col ] = 1;
          }
        }
      }

      function clearCovers() {
        coveredRows = [];
        coveredCols = [];
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

    return;
  }

  return {
    calculate: calculate,

    Matrix: {
      log: logMatrix
    }
  };

}) ();
