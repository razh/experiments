/*globals define*/
define([
  'backbone'
], function( Backbone ) {
  'use strict';

  var Box = Backbone.Model.extend({
    defaults: function() {
      return {
        width: 0,
        height: 0,
        depth: 0
      };
    }
  });

  return Box;
});
