(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var Shape = {
    regularPolygon: function( sides ) {
      var angle = -PI2 / sides;

      var vertices = [];

      for ( var i = 0; i < sides; i++ ) {
        vertices.push( Math.cos( i * angle ) );
        vertices.push( Math.sin( i * angle ) );
      }

      return vertices;
    }
  };

}) ( window, document );
