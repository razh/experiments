/*exported Camera*/
var Camera = (function() {
  'use strict';

  var DEG_TO_RAD = Math.PI / 180;

  function Camera( fov, aspect, near, far ) {
    this.fov = fov || 60;
    this.aspect = aspect || 1;
    this.near = near || 0.1;
    this.far = far || 1000;

    this.matrix = new Float32Array( 16 );
  }

  Camera.prototype.updateProjectionMatrix = function() {
    var near = this.near,
        far  = this.far;

    var top    = near * Math.tan( this.fov * 0.5 * DEG_TO_RAD ),
        bottom = -top,
        left   = bottom * this.aspect,
        right  = top * this.aspect;

    var x = 2 * near / ( right - left ),
        y = 2 * near / ( top - bottom );

    var a = ( right + left ) / ( right - left ),
        b = ( top + bottom ) / ( top - bottom ),
        c = -( far + near ) / ( far - near ),
        d = -2 * far * near / ( far - near );

    var m = this.matrix;

    m[  0 ] = x;
    m[  1 ] = 0;
    m[  2 ] = 0;
    m[  3 ] = 0;
    m[  4 ] = 0;
    m[  5 ] = y;
    m[  6 ] = 0;
    m[  7 ] = 0;
    m[  8 ] = a;
    m[  9 ] = b;
    m[ 10 ] = c;
    m[ 11 ] = -1;
    m[ 12 ] = 0;
    m[ 13 ] = 0;
    m[ 14 ] = d;
    m[ 15 ] = 0;

    return this;
  };

  Camera.prototype.transform = function( x, y, z ) {
    var m = this.matrix;

    return [
      m[ 0 ] * x + m[ 4 ] * y + m[  8 ] * z + m[ 12 ],
      m[ 1 ] * x + m[ 5 ] * y + m[  9 ] * z + m[ 13 ],
      m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ]
    ];
  };

  Camera.prototype.project = function( x, y, z ) {
    var m = this.matrix;
    var d = 1 / ( m[ 3 ] * x + m[ 7 ] * y + m[ 11 ] * z + m[ 15 ] );

    return [
      ( m[ 0 ] * x + m[ 4 ] * y + m[  8 ] * z + m[ 12 ] ) * d,
      ( m[ 1 ] * x + m[ 5 ] * y + m[  9 ] * z + m[ 13 ] ) * d,
      ( m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ] ) * d
    ];
  };

  return Camera;

}) ();
