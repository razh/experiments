/*globals define*/
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/box-view.html'
], function( $, _, Backbone, boxTemplate ) {
  'use strict';

  var BoxView = Backbone.View.extend({
    template: _.template( boxTemplate ),

    initialize: function( options ) {
      this.transforms      = options.transforms;
      this.transformOrigin = options.transformOrigin;

      _.bindAll( this, 'render' );
      this.listenTo( this.model, 'change', this.updateBox );
      this.listenTo( this.transforms, 'change add remove', this.updateTransforms );
      this.listenTo( this.transformOrigin, 'change', this.updateTransformOrigin );
    },

    render: function() {
      this.$el.prepend( this.template() )
        .css({
          '-webkit-transform-style': 'preserve-3d',
          'transform-style': 'preserve-3d'
        });

      this.updateBox();
      this.updateTransforms();
      this.updateTransformOrigin();

      return this;
    },

    updateBox: function() {
      var model = this.model;

      var width  = model.get( 'width'  ),
          height = model.get( 'height' ),
          depth  = model.get( 'depth'  );

      var halfWidth  = 0.5 * width,
          halfHeight = 0.5 * height,
          halfDepth  = 0.5 * depth;

      // Loop variables.
      var top, bottom, back, front, left, right;
      var transform;

      var $faces = this.$el.children( '.face' );
      $faces.each(function( index, face ) {
        var $face = $( face );

        top    = $face.hasClass( 'top'    );
        bottom = $face.hasClass( 'bottom' );
        back   = $face.hasClass( 'back'   );
        front  = $face.hasClass( 'front'  );
        left   = $face.hasClass( 'left'   );
        right  = $face.hasClass( 'right'  );

        // Set face dimensions and origin.
        if ( top || bottom ) {
          $face.css({
            width:  width + 'px',
            height: depth + 'px',

            'margin-left': -halfWidth + 'px',
            'margin-top':  -halfDepth + 'px'
          });
        }

        if ( back || front ) {
          $face.css({
            width:  width  + 'px',
            height: height + 'px',

            'margin-left': -halfWidth  + 'px',
            'margin-top':  -halfHeight + 'px'
          });
        }

        if ( left || right ) {
          $face.css({
            width:  depth  + 'px',
            height: height + 'px',

            'margin-left': -halfDepth  + 'px',
            'margin-top':  -halfHeight + 'px'
          });
        }

        // Set transforms: translations and rotations.
        if ( top    ) { transform = 'translate3d(0, ' + -halfHeight + 'px, 0) rotateX( 90deg)'; }
        if ( bottom ) { transform = 'translate3d(0, ' +  halfHeight + 'px, 0) rotateX(-90deg)'; }

        if ( back  ) { transform = 'translate3d(0, 0, ' + -halfDepth + 'px) rotateY(180deg)'; }
        if ( front ) { transform = 'translate3d(0, 0, ' +  halfDepth + 'px) rotateY(  0deg)'; }

        if ( left  ) { transform = 'translate3d(' + -halfWidth + 'px, 0, 0) rotateY(-90deg)'; }
        if ( right ) { transform = 'translate3d(' +  halfWidth + 'px, 0, 0) rotateY( 90deg)'; }

        $face.css({
          '-webkit-transform': transform,
          transform: transform
        });
      });
    },

    updateTransforms: function() {
      var transforms = this.transforms.toString();
      this.$el.css({
        '-webkit-transform': transforms,
        transform: transforms
      });
    },

    updateTransformOrigin: function() {
      var transformOrigin = this.transformOrigin.toString();
      this.$el.css({
        '-webkit-transform-origin': transformOrigin,
        'transform-origin': transformOrigin
      });
    }
  });

  return BoxView;
});
