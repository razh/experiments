/*globals define*/
define([
  'underscore',
  'backbone'
], function( _, Backbone ) {
  'use strict';

  /**
   * BaseModel allows us to set a model's attributes with either a single Number
   * or an Array, in addition to the standard attributes hash method.
   *
   * Usage:
   *
   * Passing a Number instead of an attributes hash:
   *
   *   var rotZ = new RotateZ(100);
   *
   * This is the same as writing:
   *
   *  var rotZ = new RotateZ({
   *    a: 100
   *  });
   *
   * Passing in an Array instead of an attributes hash:
   *
   *   var mat2d = new Matrix([1, 0, 0, 1, 100, -100]);
   *
   * This is the same as writing:
   *
   *   var mat2d = new Matrix({
   *     a: 1,
   *     b: 0,
   *     c: 0,
   *     d: 1,
   *     tx: 100,
   *     ty: -100
   *   });
   *
   * Warning: Be sure to check the constructor signature to make sure parameters
   * are passed to the correct argument slots.
   *
   * Any undefined attributes will be set to their default value.
   */
  var BaseModel = Backbone.Model.extend({
    // Allow attributes to be set with a number or an array.
    constructor: function() {
      var args = [].slice.call( arguments ),
          attributes = args.shift();

      if ( _.isNumber( attributes ) ) {
        attributes = [ attributes ];
      }

      if ( _.isArray( attributes ) ) {
        // Add an empty attributes hash so that the options argument is in
        // the correct argument slot for the Backbone.Model constructor.
        args.unshift({});
        Backbone.Model.apply( this, args );

        // Grab as many keys as we can set.
        var keys = this.keys().slice( 0, attributes.length );
        // Convert attributes array to an object.
        attributes = _.object( keys, attributes );
        // Fill in any undefined values.
        attributes = _.defaults( attributes, this.attributes );

        this.set( attributes );
      } else {
        Backbone.Model.apply( this, arguments );
      }
    }
  });

  return BaseModel;
});
