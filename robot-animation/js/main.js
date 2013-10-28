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

  var Model = Backbone.Model.extend({
    defaults: function() {
      return {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        tx: { value: 2, units: 'px' },
        ty: { value: 3, units: 'px' }
      };
    },

    constructor: function() {
      var args = [].slice.call( arguments ),
          attributes = args.shift();

      if ( _.isArray( attributes ) ) {
        Backbone.Model.apply( this, args );
        this.set( _.object( this.keys, attributes ) );
      } else {
        Backbone.Model.apply( this, arguments );
      }
    }
  });

  var m = new Model([10, 20, 30, 40, {value:5, units:'px'}, {value:10, units:'rem'}]);
  console.log( m.attributes );
});
