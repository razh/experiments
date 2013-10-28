/*globals define*/
define([
  'underscore',
  'backbone'
], function( _, Backbone ) {
  'use strict';

  var directions = [ 'top', 'bottom', 'front', 'back', 'left', 'right' ];

  var BoxView = Backbone.View.extend({
    initialize: function() {
      _.bindAll( this, 'render' );
      this.listenTo( this.model, 'change', this.render );
    },

    render: function() {
      var fragment = document.createDoucmentFragment(),
          element;

      directions.forEach(function( direction ) {
        element = document.createElement( 'div' );
        element.classList.add( 'face', direction );

        fragment.appendChild( element );
      });

      this.el.appendChild( fragment );
      return this;
    }
  });

  return BoxView;
});
