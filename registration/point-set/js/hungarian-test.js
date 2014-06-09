/*globals Hungarian*/
(function( window, document, undefined ) {
  'use strict';

  var matrix = [
    [ 1, 2, 3 ],
    [ 2, 4, 6 ],
    [ 3, 6, 9 ]
  ];

  console.log( Hungarian.Matrix.log( matrix ) );
  Hungarian.calculate( matrix );

}) ( window, document );
