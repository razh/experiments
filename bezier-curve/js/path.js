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

  BezierPath.prototype.controlPoints = function() {
    return this.curves.reduce(function( array, curve ) {
      return array.concat( curve.controlPoints() );
    }, [] );
  };

  BezierPath.prototype.last = function() {
    return this.curves[ this.curves.length - 1 ];
  };

  BezierPath.prototype.push = function( curve ) {
    if ( this.curves.length ) {
      curve.linkTo( this.last() );
    }

    this.curves.push( curve );
  };


  BezierPath.prototype.insertAt = function( curve, index ) {
    curve.unlink();

    var prev = this.curves[ index - 1 ],
        next = this.curves[ index ];

    if ( prev ) {
      curve.linkTo( prev );
    }

    if ( next ) {
      next.linkTo( curve );
    }
  };

  BezierPath.prototype.removeAt = function( index ) {
    var prev = this.curves[ index - 1 ],
        curr = this.curves[ index ],
        next = this.curves[ index + 1 ];

    if ( prev ) {
      curr.unlink();

      if ( next ) {
        next.linkTo( prev );
      }
    }

    if ( next ) {
      next.unlink();
    }
  };

  BezierPath.prototype.remove = function( curve ) {
    var index = this.curves.indexOf( curve );
    if ( index !== -1 ) {
      this.removeAt( index );
    }
  };

  return BezierPath;

}) ();
