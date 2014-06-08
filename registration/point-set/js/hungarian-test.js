/*globals Hungarian*/
(function( window, document, undefined ) {
  'use strict';

  var matrix = [
    [ 4000, 2, 8 ],
    [ 4, 3, 7 ],
    [ 3, 1, 6 ]
  ];

  console.log( Hungarian.Matrix.log( matrix, 1 ) );

}) ( window, document );
