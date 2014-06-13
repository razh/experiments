(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  var Geometry = {
    createRegularPolygon: function( sides ) {
      var angle = -PI2 / sides;

      var vertices = [];

      for ( var i = 0; i < sides; i++ ) {
        vertices.push( Math.cos( i * angle ) );
        vertices.push( Math.sin( i * angle ) );
      }

      return vertices;
    },

    drawPolygon: function( ctx, vertices ) {
      if ( !vertices.length ) {
        return;
      }

      ctx.beginPath();

      ctx.moveTo( vertices[0], vertices[1] );
      for ( var i = 1, il = 0.5 * vertices.length; i < il; i++ ) {
        ctx.lineTo( vertices[ 2 * i ], vertices[ 2 * i + 1 ] );
      }

      ctx.closePath();
    }
  };

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  var pentagon = Geometry.createRegularPolygon(5);

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var radius = Math.max( width, height );

    ctx.save();
    ctx.translate( 0.5 * width, 0.5 * height );

    for ( var i = 10; i < radius; i += 10 ) {
      ctx.save();
      ctx.scale( i, i );
      Geometry.drawPolygon( ctx, pentagon );
      ctx.restore();

      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }

    ctx.restore();
  }

  init();
  draw( context );

}) ( window, document );
