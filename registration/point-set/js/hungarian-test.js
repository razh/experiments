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
    },
    // From: github.com/tdedecko/hungarian-algorithm
    {
      matrix: [
        [ 4, 2, 8 ],
        [ 4, 3, 7 ],
        [ 3, 1, 6 ]
      ],
      solution: [ 1, 2, 0 ],
      cost: 12
    },
    // From: github.com/bmc/munkres
    {
      matrix: [
        [ 400, 150, 400 ],
        [ 400, 450, 600 ],
        [ 300, 225, 300 ]
      ],
      solution: [ 1, 0, 2 ],
      cost: 850
    },
    {
      matrix: [
        [ 400, 150, 400, 1 ],
        [ 400, 450, 600, 2 ],
        [ 300, 225, 300, 3 ]
      ],
      solution: [ 1, 3, 0 ],
      cost: 452
    },
    {
      matrix: [
        [ 10, 10, 8 ],
        [  9,  8, 1 ],
        [  9,  7, 4 ],
      ],
      solution: [ 0, 2, 1 ],
      cost: 18
    },
    {
      matrix: [
        [ 10, 10, 8, 11 ],
        [  9,  8, 1,  1 ],
        [  9,  7, 4, 10 ]
      ],
      solution: [ 0, 3, 2 ],
      cost: 15
    }
  ]);

}) ( window, document );
