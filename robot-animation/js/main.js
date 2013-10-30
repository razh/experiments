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

  var $robot = $( '.robot' );
  $robot.html( _.template( robotTemplate ) );

  // Haphazard configuration object.
  var config = (function() {
    var head = {
      width: 40,
      height: 40,
      depth: 40
    };

    var chest = {
      width: 80,
      height: 100,
      depth: 35
    };

    var hips = {
      width: 60,
      height: 40,
      depth: 35
    };

    var upperArm = {
      width: 20,
      height: 60,
      depth: 20
    };

    var lowerArm = {
      width: 20,
      height: 40,
      depth: 20
    };

    var hand = {
      width: 20,
      height: 20,
      depth: 20
    };

    // Note: the femur should be ~26% of body height.
    var upeprLeg = {
      width: 25,
      height: 50,
      depth: 25
    };

    // Femur:tibia ratio should be 56:44. This guy's proportions are out of wack.
    var lowerLeg = {
      width: 25,
      height: 70,
      depth: 25
    };

    var foot = {
      width: 30,
      height: 15,
      depth: 50
    };

    return {
      head: {
        dimensions: [ head.width, head.height, head.depth ],
        translate3d: [ 0, -80, 0 ],
      },
      chest: {
        dimensions: [ chest.width, chest.height, chest.depth ]
      },
      hips: {
        dimensions: [ hips.width, hips.height, hips.depth ],
        translate3d: [ 0, 80, 0 ],
        transformOrigin: [ 0, -0.5 * hips.height ]
      },
      upperArm: {
        dimensions: [ upperArm.width, upperArm.height, upperArm.depth ],
        transformOrigin: [ 0, -0.5 * upperArm.height ]
      },
      lowerArm: {
        dimensions: [ lowerArm.width, lowerArm.height, lowerArm.depth ],
        translate3d: [ 0, 60, 0 ],
        transformOrigin: [ 0, -0.5 * lowerArm.height ]
      },
      hand: {
        dimensions: [ hand.width, hand.height, hand.depth ],
        translate3d: [ 0, 40, 0 ],
        transformOrigin: [ 0, -0.5 * hand.height ]
      },
      armLeft: [ 60 ],
      armRight: [ -60 ],
      upperLeg: {
        dimensions: [ 25, 50, 25 ],
        translate3d: [ 0, 55, 0 ]
      },
      lowerLeg: {
        dimensions: [ 25, 70, 25 ],
        translate3d: [ 0, 70, 0 ]
      },
      foot: {
        dimensions: [ 30, 15, 50 ],
        translate3d: [ 0, 50, 10 ]
      },
      legLeft: [ 25 ],
      legRight: [ -25 ]
    };
  }) ();

  function createBoxView( name ) {
    return new BoxView({
      el: $robot.find( name ),
      model: new Box( config[ name ].dimensions ),
      transforms: new Transforms([
        new Transform.Translate3D( config[ name ].translate3d )
      ]),
      transformOrigin: new Transform.Origin( config)
    });
  }

  var headBoxView = createBoxView( 'head' );
});
