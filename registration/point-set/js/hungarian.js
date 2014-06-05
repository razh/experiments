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
  }

  return {
    calculate: calculate
  };

}) ();
