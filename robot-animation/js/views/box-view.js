/*globals define*/
define([
  'jquery',
  'underscore',
  'backbone'
], function( $, _, Backbone ) {
  'use strict';

  var directions = [ 'top', 'bottom', 'front', 'back', 'left', 'right' ];

  var BoxView = Backbone.View.extend({
    initialize: function( options ) {
      this.transforms      = options.transforms;
      this.transformOrigin = options.transformOrigin;

      _.bindAll( this, 'render' );
      this.listenTo( this.model, 'change', this.updateBox );
      this.listenTo( this.transforms, 'change add remove', this.updateTransforms );
      this.listenTo( this.transformOrigin, 'change', this.updateTransformOrigin );
    },

    render: function() {
      var fragment = document.createDocumentFragment(),
          element;

      directions.forEach(function( direction ) {
        element = document.createElement( 'div' );
        element.classList.add( 'face', direction );

        fragment.appendChild( element );
      });

      this.$el.append( fragment );
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

      var $faces = this.$.find( '.face' );
      $faces.each(function( face ) {
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

        if ( back   ) { transform = 'translate3d(0, 0, ' + -halfDepth + 'px) rotateY(180deg)'; }
        if ( front  ) { transform = 'translate3d(0, 0, ' +  halfDepth + 'px) rotateY(  0deg)'; }

        if ( left   ) { transform = 'translate3d(' + -halfWidth + 'px, 0, 0) rotateY(-90deg)'; }
        if ( right  ) { transform = 'translate3d(' +  halfWidth + 'px, 0, 0) rotateY( 90deg)'; }

        $face.css({
          '-webkit-transform': transform,
          transform: transform
        });
      });
    },

    updateTransforms: function() {
      var transforms = this.transforms.toStrings();
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
