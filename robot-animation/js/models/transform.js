/*globals define*/
define([
  'underscore',
  'backbone',
  'models/dimension'
], function( _, Backbone, Dimension ) {
  'use strict';

  var Angle  = Dimension.Angle,
      Length = Dimension.Length;

  var Transform = Backbone.Model.extend({
    // Allow attributes to be set with an array.
    constructor: function() {
      var args = [].slice.call( arguments ),
          attributes = args.shift();

      if ( _.isArray( attributes ) ) {
        Backbone.Model.apply( this, args );
        this.set( _.object( this.keys, attributes ) );
      } else {
        Backbone.Model.apply( this, arguments );
      }
    },

    toString: function() {
      return '';
    }
  });


  var Matrix = Transform.extend({
    defaults: function() {
      return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: new Length(),
        ty: new Length()
      };
    },

    constructor: function() {
      Transform.apply( this, arguments );
      // Placeholder.
      [ 'tx', 'ty' ].forEach(function( key ) {
        if ( !( this.get( key ) instanceof Length ) ) {
          throw new TypeError( key + ' not of type Length.' );
        }
      });
    },

    toString: function() {
      return 'matrix(' +
        this.get( 'a' ) + ', ' +
        this.get( 'b' ) + ', ' +
        this.get( 'c' ) + ', ' +
        this.get( 'd' ) + ', ' +
        this.get( 'tx' ) + ', ' +
        this.get( 'ty' ) +
      ')';
    }
  });
  // var mat =

  var Matrix3D = Transform.extend({
    defaults: function() {
      // Use the identity matrix.
      return {
        a0: 1,
        b0: 0,
        c0: 0,
        d0: 0,
        a1: 0,
        b1: 1,
        c1: 0,
        d1: 0,
        a2: 0,
        b2: 0,
        c2: 1,
        d2: 0,
        a3: new Length(),
        b3: new Length(),
        c3: new Length(),
        d3: 1
      };
    },

    constructor: function() {
      Transform.apply( this, arguments );
      // TODO: Determine whether or not these checks are necessary.
      [ 'a3', 'b3', 'c3' ].forEach(function( key ) {
        if ( !( this.get( key ) instanceof Length ) ) {
          throw new TypeError( key + ' not of type Length.' );
        }
      });
    },

    toString: function() {
      return 'matrix3d(' +
        this.get( 'a0' ) + ', ' +
        this.get( 'b0' ) + ', ' +
        this.get( 'c0' ) + ', ' +
        this.get( 'd0' ) + ', ' +
        this.get( 'a1' ) + ', ' +
        this.get( 'b1' ) + ', ' +
        this.get( 'c1' ) + ', ' +
        this.get( 'd1' ) + ', ' +
        this.get( 'a2' ) + ', ' +
        this.get( 'b2' ) + ', ' +
        this.get( 'c2' ) + ', ' +
        this.get( 'd2' ) + ', ' +
        this.get( 'a3' ) + ', ' +
        this.get( 'b3' ) + ', ' +
        this.get( 'c3' ) + ', ' +
        this.get( 'd3' ) +
      ')';
    }
  });


  var Rotate = Transform.extend({
    defaults: function() {
      return {
        a: new Angle()
      };
    },

    constructor: function() {
      Transform.apply( this, arguments );
      if ( !( this.get( 'a' ) instanceof Angle ) ) {
        throw new TypeError( 'Rotation angle not of type Angle.' );
      }
    },

    toString: function() {
      return 'rotate(' + this.a + ')';
    }
  });


  var RotateX = Rotate.extend({
    toString: function() {
      return 'rotateX(' + this.get( 'a' ) + ')';
    }
  });

  var RotateY = Rotate.extend({
    toString: function() {
      return 'rotateY(' + this.get( 'a' ) + ')';
    }
  });

  var RotateZ = Rotate.extend({
    toString: function() {
      return 'rotateZ(' + this.get( 'a' ) + ')';
    }
  });

  var Rotate3D = Rotate.extend({
    defaults: function() {
      return {
        x: 0,
        y: 0,
        z: 0,
        a: new Angle()
      };
    },

    toString: function() {
      return 'rotate3d(' +
        this.get( 'x' ) + ', ' +
        this.get( 'y' ) + ', ' +
        this.get( 'z' ) + ', ' +
        this.get( 'a' ) +
      ')';
    }
  });


  var Scale = Transform.extend({
    defaults: function() {
      return {
        sx: 1,
        sy: 1
      };
    },

    toString: function() {
      return 'scale(' +
        this.get( 'sx' ) + ', ' +
        this.get( 'sy' ) +
      ')';
    }
  });

  var Scale3D = Scale.extend({
    defaults: function() {
      var defaults = Scale.prototype.defaults();
      defaults.sz = 1;
      return defaults;
    },

    toString: function() {
      return 'scale3d(' +
        this.get( 'sx' ) + ', ' +
        this.get( 'sy' ) + ', ' +
        this.get( 'sz' ) +
      ')';
    }
  });

  // Base class for all one-dimensional scales.
  var Scale1D = Transform.extend({
    defaults: function() {
      return {
        s: 1
      };
    }
  });

  var ScaleX = Scale1D.extend({
    toString: function() {
      return 'scaleX(' + this.get( 's' ) + ')';
    }
  });

  var ScaleY = Scale1D.extend({
    toString: function() {
      return 'scaleY(' + this.get( 's' ) + ')';
    }
  });

  var ScaleZ = Scale1D.extend({
    toString: function() {
      return 'scaleZ(' + this.get( 's' ) + ')';
    }
  });


  // Base class for skews.
  // Warning: this is not intended to be used as the skew() CSS transform.
  var Skew = Transform.extend({
    defaults: function() {
      return {
        a: new Angle()
      };
    },

    constructor: function() {
      Transform.apply( this, arguments );
      if ( !( this.get( 'a' ) instanceof Angle ) ) {
        throw new TypeError( 'Skew angle not of type Angle.' );
      }
    }
  });

  var SkewX = Skew.extend({
    toString: function() {
      return 'skewX(' + this.get( 'a' ) + ')';
    }
  });

  var SkewY = Skew.extend({
    toString: function() {
      return 'skewY(' + this.get( 'a' ) + ')';
    }
  });


  var Translate = Transform.extend({
    defaults: function() {
      return {
        tx: new Length(),
        ty: new Length()
      };
    },

    constructor: function() {
      Transform.apply( this, arguments );
      [ 'tx', 'ty' ].forEach(function( key ) {
        if ( !( this.get( key ) instanceof Length ) ) {
          throw new TypeError( key + ' not of type Length.' );
        }
      });
    },

    toString: function() {
      return 'translate(' +
        this.get( 'tx' ) + ', ' +
        this.get( 'ty' ) + ', ' +
      ')';
    }
  });

  var Translate3D = Translate.extend({
    defaults: function() {
      var defaults = Translate.prototype.defaults();
      defaults.tz = new Length();
      return defaults;
    },

    constructor: function() {
      Translate.apply( this, arguments );
      if ( !( this.get( 'tz' ) instanceof Length ) ) {
        throw new TypeError( 'tz not of type Length.' );
      }
    },

    toString: function() {
      return 'translate3d(' +
        this.get( 'tx' ) + ', ' +
        this.get( 'ty' ) + ', ' +
        this.get( 'tz' ) +
      ')';
    }
  });

  // Base class for one-dimensional translations.
  var Translate1D = Transform.extend({
    defaults: function() {
      return {
        t: new Length()
      };
    },

    constructor: function() {
      Transform.apply( this, arguments );
      if ( !( this.get( 't' ) instanceof Length ) ) {
        throw new TypeError( 't not of type Length.' );
      }
    }
  });

  var TranslateX = Translate1D.extend({
    toString: function() {
      return 'translateX(' + this.get( 't' ) + ')';
    }
  });

  var TranslateY = Translate1D.extend({
    toString: function() {
      return 'translateY(' + this.get( 't' ) + ')';
    }
  });

  var TranslateZ = Translate1D.extend({
    toString: function() {
      return 'translateZ(' + this.get( 't' ) + ')';
    }
  });


  Transform.Matrix   = Matrix;
  Transform.Matrix3D = Matrix3D;

  Transform.Rotate   = Rotate;
  Transform.RotateX  = RotateX;
  Transform.RotateY  = RotateY;
  Transform.RotateZ  = RotateZ;
  Transform.Rotate3D = Rotate3D;

  Transform.Scale   = Scale;
  Transform.Scale3D = Scale3D;
  Transform.ScaleX  = ScaleX;
  Transform.ScaleY  = ScaleY;
  Transform.ScaleZ  = ScaleZ;

  Transform.SkewX = SkewX;
  Transform.SkewY = SkewY;

  Transform.Translate   = Translate;
  Transform.Translate3D = Translate3D;
  Transform.TranslateX  = TranslateX;
  Transform.TranslateY  = TranslateY;
  Transform.TranslateZ  = TranslateZ;

  return Transform;
});
