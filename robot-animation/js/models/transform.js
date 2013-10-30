/*globals define*/
define([
  'models/base-model'
], function( BaseModel ) {
  'use strict';

  var Transform = BaseModel.extend({
    toString: function() {
      return '';
    }
  });

  var Origin = Transform.extend({
    defaults: function() {
      return {
        x: 0,
        y: 0,
        z: 0
      };
    },

    toString: function() {
      return this.get( 'x' ) + 'px ' +
             this.get( 'y' ) + 'px ' +
             this.get( 'z' ) + 'px';
    }
  });


  var Matrix = Transform.extend({
    defaults: function() {
      return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        tx: 0,
        ty: 0
      };
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
        a3: 0,
        b3: 0,
        c3: 0,
        d3: 1
      };
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
        a: 0
      };
    },

    toString: function() {
      return 'rotate(' + this.a + 'deg)';
    }
  });


  var RotateX = Rotate.extend({
    toString: function() {
      return 'rotateX(' + this.get( 'a' ) + 'deg)';
    }
  });

  var RotateY = Rotate.extend({
    toString: function() {
      return 'rotateY(' + this.get( 'a' ) + 'deg)';
    }
  });

  var RotateZ = Rotate.extend({
    toString: function() {
      return 'rotateZ(' + this.get( 'a' ) + 'deg)';
    }
  });

  var Rotate3D = Rotate.extend({
    defaults: function() {
      return {
        x: 0,
        y: 0,
        z: 0,
        a: 0
      };
    },

    toString: function() {
      return 'rotate3d(' +
        this.get( 'x' ) + ', ' +
        this.get( 'y' ) + ', ' +
        this.get( 'z' ) + ', ' +
        this.get( 'a' ) + 'deg)';
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
        a: 0
      };
    }
  });

  var SkewX = Skew.extend({
    toString: function() {
      return 'skewX(' + this.get( 'a' ) + 'deg)';
    }
  });

  var SkewY = Skew.extend({
    toString: function() {
      return 'skewY(' + this.get( 'a' ) + 'deg)';
    }
  });


  var Translate = Transform.extend({
    defaults: function() {
      return {
        tx: 0,
        ty: 0
      };
    },

    toString: function() {
      return 'translate(' +
        this.get( 'tx' ) + 'px, ' +
        this.get( 'ty' ) + 'px)';
    }
  });

  var Translate3D = Translate.extend({
    defaults: function() {
      var defaults = Translate.prototype.defaults();
      defaults.tz = 0;
      return defaults;
    },

    toString: function() {
      return 'translate3d(' +
        this.get( 'tx' ) + 'px, ' +
        this.get( 'ty' ) + 'px, ' +
        this.get( 'tz' ) + 'px)';
    }
  });

  // Base class for one-dimensional translations.
  var Translate1D = Transform.extend({
    defaults: function() {
      return {
        t: 0
      };
    }
  });

  var TranslateX = Translate1D.extend({
    toString: function() {
      return 'translateX(' + this.get( 't' ) + 'px)';
    }
  });

  var TranslateY = Translate1D.extend({
    toString: function() {
      return 'translateY(' + this.get( 't' ) + 'px)';
    }
  });

  var TranslateZ = Translate1D.extend({
    toString: function() {
      return 'translateZ(' + this.get( 't' ) + 'px)';
    }
  });


  Transform.Origin = Origin;

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
