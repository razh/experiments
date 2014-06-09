/*globals Hungarian*/
(function( window, document, undefined ) {
  'use strict';

  /**
   * Determine equality of one dimensional numeric arrays.
   */
  function arrayEquals( a, b ) {
    if ( a === b ) {
      return true;
    }

    if ( a.length !== b.length ) {
      return false;
    }

    for ( var i = 0, il = a.length; i < il; i++ ) {
      if ( a[i] !== b[i] ) {
        return false;
      }
    }

    return true;
  }

  function suite( specs ) {
    var passed = 0;

    specs.forEach(function( spec, index ) {
      var clone = Hungarian.Matrix.clone( spec.matrix );
      var solution = Hungarian.calculate( clone );
      var cost = Hungarian.cost( spec.matrix, solution );

      if ( arrayEquals( solution, spec.solution ) && cost === spec.cost ) {
        passed++;
        console.log( '.' );
      } else {
        console.log(
          index +
          ': actual: (' + JSON.stringify( solution ) +
          ', cost: ' + cost + ')' +
          ', expected: (' + JSON.stringify( spec.solution ) +
          ', cost: ' +  spec.cost + ')'
        );
      }
    });
  }

  suite([
    {
      matrix: [
        [ 1, 2, 3 ],
        [ 2, 4, 6 ],
        [ 3, 6, 9 ]
      ],
      solution: [ 2, 1, 0 ],
      cost: 10
    }
  ]);

}) ( window, document );
