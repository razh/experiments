(function( window, document, undefined ) {
  'use strict';

  /**
   * Need to handle the nested skeleton structure.
   *
   * Each of these needs to be able to take a number of transform functions.
   *  matrix()
   *  matrix3d()
   *  rotate()
   *  rotate3d()
   *  rotateX()
   *  rotateY()
   *  rotateZ()
   *  scale()
   *  scale3d()
   *  scaleX()
   *  scaleY()
   *  scaleZ()
   *  skewX()
   *  skewY()
   *  translate()
   *  translate3d()
   *  translateX()
   *  translateY()
   *  translateZ()
   */

  function Dimension( value, units ) {
    this.value = value || 0;
    this.units = units || '';
  }

  Dimension.prototype.toString = function() {
    return this.value + this.units;
  };

  function Angle( value, units ) {
    Dimension.call( this, value, units );
  }

  Angle.prototype = new Dimension();
  Angle.prototype.constructor = Angle;

  function Length( value, units ) {
    Dimension.call( this, value, units );
  }

  Length.prototype = new Dimension();
  Length.prototype.constructor = Length;


  function Transform() {}

  Transform.prototype.toString = function() { return ''; };


  function Matrix( a, b, c, d, tx, ty ) {
    this.a = a || 0;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 0;
    this.tx = tx !== 'undefined' ? tx : new Length();
    this.ty = ty !== 'undefined' ? ty : new Length();
  }

  Matrix.prototype = new Transform();
  Matrix.prototype.constructor = Matrix;

  Matrix.prototype.toString = function() {
    return 'matrix(' +
      this.a + ', ' +
      this.b + ', ' +
      this.c + ', ' +
      this.d + ', ' +
      this.tx + ', ' +
      this.ty + ')';
  };


  function Matrix3D() {
    this.a0 = arguments[ 0] || 0;
    this.b0 = arguments[ 1] || 0;
    this.c0 = arguments[ 2] || 0;
    this.d0 = arguments[ 3] || 0;
    this.a1 = arguments[ 4] || 0;
    this.b1 = arguments[ 5] || 0;
    this.c1 = arguments[ 6] || 0;
    this.d1 = arguments[ 7] || 0;
    this.a2 = arguments[ 8] || 0;
    this.b2 = arguments[ 9] || 0;
    this.c2 = arguments[10] || 0;
    this.d2 = arguments[11] || 0;
    this.a3 = arguments[12] !== 'undefined' ? arguments[12] : new Length();
    this.b3 = arguments[13] !== 'undefined' ? arguments[13] : new Length();
    this.c3 = arguments[14] !== 'undefined' ? arguments[14] : new Length();
    this.d3 = arguments[15] || 0;
  }

  Matrix3D.prototype = new Transform();
  Matrix3D.prototype.constructor = Matrix3D;

  Matrix3D.prototype.toString = function() {
    return 'matrix3d(' +
      this.a0 + ', ' + this.b0 + ', ' + this.c0 + ', ' + this.d0 + ', ' +
      this.a1 + ', ' + this.b1 + ', ' + this.c1 + ', ' + this.d1 + ', ' +
      this.a2 + ', ' + this.b2 + ', ' + this.c2 + ', ' + this.d2 + ', ' +
      this.a3 + ', ' + this.b3 + ', ' + this.c3 + ', ' + this.d3 + ')';
  };


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

  function TransformView( options ) {
    this.el = options.el;
    this.model = options.model;
  }

  TransformView.prototype.render = function() {};
}) ( window, document );
