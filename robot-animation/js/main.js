/*globals requirejs, define*/
requirejs.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: [ 'jquery', 'underscore' ],
      exports: 'Backbone'
    }
  },

  paths: {
    'backbone': '../../app/components/backbone/backbone-min',
    'jquery': '../../app/components/jquery/jquery.min',
    'underscore': '../../app/components/underscore/underscore-min',
    'text': '../../app/components/requirejs-text/text'
  }
});

define(function( require ) {
  'use strict';

  var Transform     = require( 'models/transform' ),
      Transforms    = require( 'collections/transforms' ),
      TransformView = require( 'views/transform-view' );

  var Box     = require( 'models/box' ),
      BoxView = require( 'views/box-view' );

  var mat = new Transform.Matrix([10, 20, 30, 40, 5, 200, 2000]);
  console.log( mat.attributes );

  var matView = new TransformView({
    el: '#matrix',
    model: mat
  });

  matView.render();

  var boxView = new BoxView({
    el: '#box',
    model: new Box({
      width: 100,
      height: 50,
      depth: 100
    }),
    transforms: new Transforms( new Transform.RotateY( [ 0 ] ) ),
    transformOrigin: new Transform.Origin()
  });

  boxView.render();

  var rotateView = new TransformView({
    el: '#rotate',
    model: boxView.transforms.at(0)
  });

  rotateView.render();
});
