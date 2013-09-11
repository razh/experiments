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

  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
  }

  function limit( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  function randomInt( min, max ) {
    return Math.round( min + Math.random() * ( max - min ) );
  }

  var _        = require( 'underscore' ),
      Backbone = require( 'backbone' );

  var RGBAColor = Backbone.Model.extend({
    defaults: function() {
      return {
        red:   0,
        green: 0,
        blue:  0,
        alpha: 0.0
      };
    },

    css: function( totalAlpha ) {
      totalAlpha = _.isUndefined( totalAlpha ) ? 1 : totalAlpha;

      return 'rgba(' +
        Math.round( limit( this.get( 'red'   ), 0, 255 ) ) + ', ' +
        Math.round( limit( this.get( 'green' ), 0, 255 ) ) + ', ' +
        Math.round( limit( this.get( 'blue'  ), 0, 255 ) ) + ', ' +
        round( this.get( 'alpha' ) / totalAlpha, 2 ) +
      ')';
    }
  });

  var HSLAColor = Backbone.Model.extend({
    defaults: function() {
      return {
        hue:        0,
        saturation: 0,
        lightness:  0,
        alpha:      0.0
      };
    },

    css: function( totalAlpha ) {
      totalAlpha = _.isUndefined( totalAlpha ) ? 1 : totalAlpha;

      return 'hsla(' +
        Math.round( limit( this.get( 'hue' ), 0, 360 ) ) + ', ' +
        this.get( 'saturation' ).toFixed(0) + '%, ' +
        this.get( 'lightness' ).toFixed(0)  + '%, ' +
        round( this.get( 'alpha' ) / totalAlpha, 2 ) +
      ')';
    }
  });

  var ColorStop = Backbone.Model.extend({
    defaults: function() {
      return {
        color: new RGBAColor(),
        position: ''
      };
    },

    css: function( totalAlpha ) {
      var color    = this.get( 'color' ).css( totalAlpha ),
          position = this.position ? ' ' + this.position : '';

      return color + position;
    }
  });

  var Gradient = Backbone.Model.extend({
    defaults: function() {
      return {
        colorStops: [],
        repeating: false
      };
    },

    css: function() {},

    colorStopsString: function( totalAlpha ) {
      return this.get( 'colorStops' ).map(function( colorStop ) {
        return colorStop.css( totalAlpha );
      }).join( ', ' );
    },

    maxAlpha: function() {
      return Math.max.apply( this, this.get( 'colorStops' ).map(function( colorStop ) {
        return colorStop.get( 'alpha' );
      }));
    }
  });

  var LinearGradient = Gradient.extend({
    defaults: function() {
      var defaults = Gradient.prototype.defaults();
      defaults.direction = LinearGradient.Direction.BOTTOM;
      return defaults;
    },

    css: function( totalAlpha ) {
      var angle = this.get( 'angle' );
      angle = angle ? angle + ', ' : '';

      var colorStopsString = this.colorStopsString( totalAlpha );

      return 'linear-gradient(' + angle + colorStopsString + ')';
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
    defaults: function() {
      var defaults = Gradient.prototype.defaults();
      defaults.position = '';
      defaults.angle    = '';
      defaults.shape    = '';
      defaults.size     = '';
      return defaults;
    },

    css: function( totalAlpha ) {
      var position = this.get( 'position' );
      position = position ? position + ', ' : '';

      var shape = this.get( 'shape' );
      shape = shape ? shape + ', ' : '';

      var colorStopsString = this.colorStopsString( totalAlpha );

      return 'radial-gradient(' + position + shape + colorStopsString + ')';
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

  var Background = Backbone.Model.extend({
    defaults: function() {
      return {
        gradients: []
      };
    },

    css: function() {
      var totalAlpha = this.get( 'gradients' ).reduce(function( previousValue, gradient ) {
        return previousValue + gradient.maxAlpha();
      }, 0 );

      return this.gradients.map(function( gradient ) {
        return gradient.css( totalAlpha );
      }).join( ', ' );
    }
  });
});
