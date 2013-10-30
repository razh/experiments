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
      $ = require( 'jquery' );

  var Transform     = require( 'models/transform' ),
      Transforms    = require( 'collections/transforms' ),
      TransformView = require( 'views/transform-view' );

  var Box     = require( 'models/box' ),
      BoxView = require( 'views/box-view' );

  var mat = new Transform.Matrix( [ 10, 20, 30, 40, 5, 200, 2000 ] );
  console.log( mat.attributes );

  var matView = new TransformView({
    el: '#matrix',
    model: mat
  });

  matView.render();

  var boxView = new BoxView({
    el: '#box',
    model: new Box( [ 100, 50, 100 ] ),
    transforms: new Transforms([
      new Transform.RotateY( 40 ),
      new Transform.RotateX( 30 )
    ]),
    transformOrigin: new Transform.Origin()
  });

  boxView.render();

  var boxDimensionsView = new TransformView({
    el: '#box-dimensions',
    model: boxView.model
  });

  boxDimensionsView.render();


  var rotateYView = new TransformView({
    el: '#rotateY',
    model: boxView.transforms.at(0)
  });

  rotateYView.render();

  var rotateXView = new TransformView({
    el: '#rotateX',
    model: boxView.transforms.at(1)
  });

  rotateXView.render();

  var robotTemplate = require( 'text!templates/robot.html' );

  $( '.robot' ).html( _.template( robotTemplate ) );
});
