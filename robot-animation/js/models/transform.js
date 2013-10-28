/*globals define*/
define([
  'underscore',
  'backbone',
  'models/units'
], function( _, Backbone, Units ) {
  'use strict';

  var Angle  = Units.Angle,
      Length = Units.Length;

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

    toString: function() {
      return 'matrix(' +
        this.get( 'a' ) + ', ' +
        this.get( 'b' ) + ', ' +
        this.get( 'c' ) + ', ' +
        this.get( 'd' ) + ', ' +
        this.get( 'tx' ) + ', ' +
        this.get( 'ty' ) + ')';
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
        this.get( 'd3' ) + ')';
     }
  });





  function Rotate( a ) {
    this.a = typeof a !== 'undefined' ? a : new Angle();
  }

  Rotate.prototype = new Transform();
  Rotate.prototype.constructor = Rotate;

  Rotate.prototype.toString = function() {
    return 'rotate(' + this.a + ')';
  };


  function RotateX( a ) {
    Rotate.call( this, a );
  }

  RotateX.prototype = new Transform();
  RotateX.prototype.constructor = RotateX;

  RotateX.prototype.toString = function() {
    return 'rotateX(' + this.a + ')';
  };


  function RotateY( a ) {
    Rotate.call( this, a );
  }

  RotateY.prototype = new Transform();
  RotateY.prototype.constructor = RotateY;

  RotateY.prototype.toString = function() {
    return 'rotateY(' + this.a + ')';
  };


  function RotateZ( a ) {
    Rotate.call( this, a );
  }

  RotateZ.prototype = new Transform();
  RotateZ.prototype.constructor = RotateZ;

  RotateZ.prototype.toString = function() {
    return 'rotateZ(' + this.a + ')';
  };


  function Rotate3D( x, y, z, a ) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    Rotate.call( this, a );
  }

  Rotate3D.prototype = new Transform();
  Rotate3D.prototype.constructor = Rotate3D;

  Rotate3D.prototype.toString = function() {
    return 'rotate3d(' +
      this.x + ', ' +
      this.y + ', ' +
      this.z + ', ' +
      this.a + ')';
  };


  function Scale( sx, sy ) {
    this.sx = typeof sx !== 'undefined' ? sx : 1;
    this.sy = typeof sy !== 'undefined' ? sy : 1;
  }

  Scale.prototype = new Transform();
  Scale.prototype.cosntructor = Scale;

  Scale.prototype.toString = function() {
    return 'scale(' +
      this.sx + ', ' +
      this.sy + ')';
  };


  function Scale3D( sx, sy, sz ) {
    Scale.call( this, sx, sy );
    this.sz = typeof sz !== 'undefined' ? sz : 1;
  }

  Scale3D.prototype = new Transform();
  Scale3D.prototype.constructor = Scale3D;

  Scale3D.prototype.toString = function() {
    return 'scale3d(' +
      this.sx + ', ' +
      this.sy + ', ' +
      this.sz + ')';
  };

  function ScaleX( s ) {
    this.s = typeof s !== 'undefined' ? s : 1;
  }

  ScaleX.prototype = new Transform();
  ScaleX.prototype.constructor = ScaleX;

  ScaleX.prototype.toString = function() {
    return 'scaleX(' + this.s + ')';
  };


  function ScaleY( s ) {
    ScaleX.call( this, s );
  }

  ScaleY.prototype = new Transform();
  ScaleY.prototype.constructor = ScaleY;

  ScaleY.prototype.toString = function() {
    return 'scaleY(' + this.s + ')';
  };


  function ScaleZ( s ) {
    ScaleX.call( this, s );
  }

  ScaleZ.prototype = new Transform();
  ScaleZ.prototype.constructor = ScaleZ;

  ScaleZ.prototype.toString = function() {
    return 'scaleZ(' + this.s + ')';
  };


  function SkewX( a ) {
    this.a = typeof a !== 'undefined' ? a : new Angle();
  }

  SkewX.prototype = new Transform();
  SkewX.prototype.cosntructor = SkewX;

  SkewX.prototype.toString = function() {
    return 'skewX(' + this.a + ')';
  };


  function SkewY( a ) {
    SkewX.call( this, a );
  }

  SkewY.prototype = new Transform();
  SkewY.prototype.cosntructor = SkewY;

  SkewY.prototype.toString = function() {
    return 'skewY(' + this.a + ')';
  };


  function Translate( tx, ty ) {
    this.tx = typeof tx !== 'undefined' ? tx : new Length();
    this.ty = typeof ty !== 'undefined' ? ty : new Length();
  }

  Translate.prototype = new Transform();
  Translate.prototype.constructor = Translate;

  function Translate3D( tx, ty, tz ) {
    Translate.call( this, tx, ty, tz );
  }

  Translate3D.prototype = new Transform();
  Translate3D.prototype.constructor = Translate3D;

  Translate3D.prototype.toString = function() {
    return 'translate3d(' +
      this.tx + ', ' +
      this.ty + ', ' +
      this.tz + ')';
  };


  function TranslateX( t ) {
    this.t = typeof t !== 'undefined' ? t : new Length();
  }

  TranslateX.prototype = new Transform();
  TranslateX.prototype.constructor = TranslateX;

  TranslateX.prototype.toString = function() {
    return 'translateX(' + this.t  + ')';
  };


  function TranslateY( t ) {
    TranslateX.call( this, t );
  }

  TranslateY.prototype = new Transform();
  TranslateY.prototype.constructor = TranslateY;

  TranslateY.prototype.toString = function() {
    return 'translateY(' + this.t + ')';
  };


  function TranslateZ( t ) {
    TranslateX.call( this, t );
  }

  TranslateZ.prototype = new Transform();
  TranslateZ.prototype.constructor = TranslateZ;

  TranslateZ.prototype.toString = function() {
    return 'translateZ(' + this.t + ')';
  };

  Transform.Matrix   = Matrix;
  Transform.Matrix3D = Matrix3D;

  return Transform;
});
