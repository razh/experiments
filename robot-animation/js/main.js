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

  var Transform = require( 'models/transform' );

  var Model = Backbone.Model.extend({
    defaults: function() {
      return {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        tx: 2,
        ty: 3
      };
    },

    constructor: function() {
      var args = [].slice.call( arguments ),
          attributes = args.shift();

      if ( _.isArray( attributes ) ) {
        Backbone.Model.apply( this, args );
        // TODO: Handle undefined values.
        console.log( _.defaults( _.object( this.keys(), attributes ), this.attributes ) );
        this.set( _.object( this.keys(), attributes ) );
      } else {
        Backbone.Model.apply( this, arguments );
      }
    }
  });

  var m = new Model([10, 20, 30, 40, 5]);
  console.log( m.attributes );
});
