/*globals define*/
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/transform-view.html'
], function( $, _, Backbone, transformTemplate ) {
  'use strict';

  var TransformView = Backbone.View.extend({
    template: _.template( transformTemplate ),

    events: {
      'change input': 'change'
    },

    initialize: function() {
      _.bindAll( this, 'render' );
      this.listenTo( this.model, 'change', this.update );
    },

    render: function() {
      this.$el.html( this.template( { transform: this.model.toJSON() } ) );
      return this;
    },

    update: function() {
      var changedAttributes = this.model.changedAttributes();
      for ( var attr in changedAttributes ) {
        this.$( '#' + attr ).val( changedAttributes[ attr ] );
      }
    },

    change: function( event ) {
      var target = event.currentTarget,
          value  = parseFloat( this.$( target ).val() );

      this.model.set( target.id, value );
    }
  });

  return TransformView;
});
