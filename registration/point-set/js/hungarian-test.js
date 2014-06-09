/*globals Hungarian*/
(function( window, document, undefined ) {
  'use strict';

  var matrix = [
    [ 1, 2, 3 ],
    [ 2, 4, 6 ],
    [ 3, 6, 9 ]
  ];

  console.log( Hungarian.Matrix.log( matrix ) );
  var solution = Hungarian.calculate( Hungarian.Matrix.clone( matrix ) );
  console.log( solution );
  console.log( Hungarian.cost( matrix, solution ) );

}) ( window, document );
