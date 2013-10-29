define([
  'backbone',
  'models/transform'
], function( Backbone, Transform ) {
  'use strict';

  var Transforms = Backbone.Collection.extend({
    model: Transform,

    toString: function() {
      return this.map(function( transform ) {
        return transform.toString();
      }).join( ' ' );
    }
  });

  return Transforms;
});
