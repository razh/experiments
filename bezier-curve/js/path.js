/*exported BezierPath*/
var BezierPath = (function() {
  'use strict';

  function BezierPath() {
    this.curves = [];
  }

  BezierPath.prototype.draw = function( ctx ) {
    if ( !this.curves.length ) {
      return;
    }

    var curve = this.curves[0];
    ctx.moveTo( curve.p0.x, curve.p0.y );
    for ( var i = 0, il = this.curves.length; i < il; i++ ) {
      curve = this.curves[i];
      ctx.bezierCurveTo(
        curve.p1.x, curve.p1.y,
        curve.p2.x, curve.p2.y,
        curve.p3.x, curve.p3.y
      );
    }
  };

  return BezierPath;

}) ();
