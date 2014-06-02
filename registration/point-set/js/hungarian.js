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
  function subtractColumnMinima( array, columnIndex ) {
    var min = Number.POSITIVE_INFINITY;
    var value;
    var i, il;
    // Create col array and find min.
    for ( i = 0, il = array.length; i < il; i++ ) {
      value = array[i][ columnIndex ];
      if ( value < min ) {
        min = value;
      }
    }

    for ( i = 0, il = array.length; i < il; i++ ) {
      array[i][ columnIndex ] -= min;
    }

    return array;
  }

  function subtractColumnsMinima( array ) {
    var i, il;
    for ( i = 0, il = array[0].length; i < il; i++ ) {
      subtractColumnMinima( array, i );
    }
  }

  function calculate( costMatrix ) {
    subtractRowsMinima( costMatrix );
    subtractColumnsMinima( costMatrix );
  }

  return {
    calculate: calculate
  };

}) ();
