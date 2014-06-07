/*exported Hungarian*/
var Hungarian = (function() {
  'use strict';

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

  function calculate( costMatrix ) {
    var coveredRows = [],
        coveredCols = [];

    subtractRowsMinima( costMatrix );
    subtractColsMinima( costMatrix );

    var marked = [];
    var i, il;
    for ( i = 0, il = costMatrix[0].length; i < il; i++ ) {
      marked.push( [] );
    }

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

    // Cover each column containing a starred zero.
    for ( i = 0, il = costMatrix.length; i < il; i++ ) {
      for ( j = 0, jl = costMatrix[i].length; j < jl; j++ ) {
        if ( marked[i][j] ) {
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

    // Finished.
    if ( count >= costMatrix[0].length ) {
      return;
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
        if ( row[i] ) {
          return true;
        }
      }

      return false;
    }

    function indexOfStar( row ) {
      for ( var i = 0, il = row.length; i < il; i++ ) {
        if ( row[i] ) {
          return i;
        }
      }

      return -1;
    }

    function step4() {
      var index;
      var starIndex;
      var done = false;
      while ( !done ) {
        index = findUncoveredZero( costMatrix, coveredRows, coveredCols );
        if ( index.row === -1 ) {
          done = true;
          step6();
        } else {
          marked[ index.row ][ index.col ] = 2;

          starIndex = indexOfStar( marked, index.row );
          if ( starIndex !== -1 ) {
            coveredRows[ index.row ] = true;
            coveredCols[ index.col ] = false;
          } else {
            done = true;
            step5();
          }
        }
      }
    }

    function step5() {
      function indexOfStarCol( costMatrix, col ) {
        for ( var i = 0, il = costMatrix.length; i < il; i++ ) {
          if ( costMatrix[i][ col ] ) {
            return i;
          }
        }
      }

      function indexOfPrimeRow( row ) {
        for ( var i = 0, il = costMatrix.length; i < il; i++ ) {
          if ( row[i] === 2 ) {
            return i;
          }
        }
      }

      function augmentPath( marked, path, pathCount ) {
        var row, col;
        for ( var i = 0, i < pathCount; i++ ) {
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
        var i, il;
        var j, jl;
        for ( i = 0; i < marked.length; i++ ) {
          for ( j = 0; j < marked[i].length; j++ ) {
            if ( marked[i][j] === 2 ) {
              marked[i][j] = 0;
            }
          }
        }
      }

      var path = [];
      var i, il;
      var j, jl;
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
          if ( coveredRows[i] ) {
            costMatrix[i][j] += min;
          }

          if ( coveredCols[j] ) {
            costMatrix[i][j] -= min;
          }
        }
      }

      step4();
    }
  }

  return {
    calculate: calculate
  };

}) ();
