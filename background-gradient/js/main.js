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
  var Backbone = require( 'backbone' );

  var ColorStop = Backbone.Model.extend({});
  var ColorStops = Backbone.Collection.extend({
    model: ColorStop
  });

  var Gradient = Backbone.Model.extend({
    default: function() {
      return {
        colorStops: new ColorStops()
      };
    }
  });

  var LinearGradient = Gradient.extend({
    toString: function() {
      return 'linear-gradient();';
    }
  });

  LinearGradient.Direction = {
    TOP:    1,
    LEFT:   2,
    BOTTOM: 4,
    RIGHT:  8
  };

  var RadialGradient = Gradient.extend({
    toString: function() {
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

  var RepeatingLinearGradient = LinearGradient.extend({});
  var RepeatingRadialGradient = RadialGradient.extend({});

  var Background = Backbone.Model.extend({});
});
