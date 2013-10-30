/*globals define*/
define([
  'models/base-model'
], function( BaseModel ) {
  'use strict';

  var Box = BaseModel.extend({
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
