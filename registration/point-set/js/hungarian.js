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
  }

  return {
    calculate: calculate
  };

}) ();
