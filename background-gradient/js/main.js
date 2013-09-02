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

  var _        = require( 'underscore' ),
      Backbone = require( 'backbone' );

  var ColorStop = Backbone.Model.extend({
    defaults: function() {
      return {
        color: '',
        position: ''
      };
    },

    css: function() {
      return color + ' ' + position;
    }
  });

  var ColorStops = Backbone.Collection.extend({
    model: ColorStop,

    css: function() {
      return this.map(function( colorStop ) {
        return colorStop.css();
      }).join( ', ' );
    }
  });

  var Gradient = Backbone.Model.extend({
    defaults: function() {
      return {
        colorStops: new ColorStops(),
        repeating: false
      };
    },

    css: function() {}
  });

  var LinearGradient = Gradient.extend({
    defaults: function() {
      var defaults = Gradient.prototype.defaults();
      defaults.direction = LinearGradient.Direction.BOTTOM;
      return defaults;
    },

    css: function() {
      return 'linear-gradient();';
    }
  });

  LinearGradient.Direction = {
    TOP:    1,
    LEFT:   2,
    BOTTOM: 4,
    RIGHT:  8
  };

  var LinearGradientView = Backbone.View.extend({
    template: _.template( '<div></div>' ),

    initialize: function() {
      _.bindAll( this, 'render' );
      this.listenTo( this.model, 'change', this.render );
    },

    render: function() {
      this.$el.html( this.template({ gradient: this.model }) );
      return this;
    }
  });

  var RadialGradient = Gradient.extend({
    css: function() {
      return 'radial-gradient();';
    }
  });

  RadialGradient.EndingShape = {
    CIRCLE:  0,
    ELLIPSE: 1
  };

  RadialGradient.Size = {
    CLOSEST_SIDE:    0,
    FARTHEST_SIDE:   1,
    CLOSEST_CORNER:  2,
    FARTHEST_CORNER: 3
  };

  var Background = Backbone.Model.extend({});
});
