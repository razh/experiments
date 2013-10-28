/*globals define*/
define([
  'backbone'
], function( Backbone ) {
  'use strict';

  /**
   * Used in a reduce() call to convert an array into an enum object.
   *
   * For example:
   *   [ 'a', 'b', 'c' ] => { 'a': 0, 'b': 1, 'c': 2 }
   */
  function reduceEnum( previousValue, currentValue, index ) {
    previousValue[ currentValue ] = index;
    return previousValue;
  }


  var Dimension = Backbone.Model.extend({
    defaults: function() {
      return {
        value: 0,
        units: ''
      };
    },

    toString: function() {
      var value = this.get( 'value' );
      return value === 0 ? value : value + this.get( 'units' );
    }
  });


  var Length = Dimension.extend();

  Length.Units = [
    // Common units.
    'px', 'rem', 'em', 'pt',
    // Viewport-percentage units.
    'vw', 'vh', 'vmin', 'vmax',
    // Rest of the absolutes.
    'cm', 'mm', 'in', 'pc',
    // Rest of the font-relatives.
    'ex', 'ch'
  ].reduce( reduceEnum, {} );


  var Angle = Dimension.extend();

  Angle.Units = [
    'deg', 'rad', 'grad', 'turn'
  ].reduce( reduceEnum, {} );


  // We'll pack Length and Angle into the Dimension namespace.
  Dimension.Length = Length;
  Dimension.Angle  = Angle;

  return Dimension;
});
