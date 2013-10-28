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

  var _ = require( 'underscore' ),
      Backbone = require( 'backbone' );

  var Transform     = require( 'models/transform' ),
      TransformView = require( 'views/transform-view' );

  var mat = new Transform.Matrix([10, 20, 30, 40, 5, 200, 2000]);
  console.log( mat.attributes );

  var matView = new TransformView({
    el: '#matrix',
    model: mat
  });

  matView.render();
});
