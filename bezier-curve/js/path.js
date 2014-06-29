/*exported BezierPath*/
var BezierPath = (function() {
  'use strict';

  /**
   *  BezierPath
   *  ===
   *
   *    ---   Endpoint
   *     |    |       \
   *     |    |        Control
   *   Curve  |
   *     |    |        Control
   *     |    |       /      |
   *    ---   Endpoint       |
   *     |    |       \      |
   *     |    |        Control
   *   Curve  |
   *     |    |        Control
   *     |    |       /      |
   *    ---   Endpoint       |
   *     |    |       \      |
   *     |    |        Control
   *   Curve  |
   *     |    |        Control
   *     |    |       /
   *    ---   Endpoint
   */
  function BezierPath() {
    this.curves = [];
  }

  BezierPath.prototype.draw = function( ctx ) {
    if ( !this.curves.length ) {
      return;
    }

    var curve = this.curves[0];
    ctx.moveTo( curve.p0.x, curve.p0.y );
    this.curves.forEach(function( curve ) {
      ctx.bezierCurveTo(
        curve.p1.x, curve.p1.y,
        curve.p2.x, curve.p2.y,
        curve.p3.x, curve.p3.y
      );
    });
  };

  BezierPath.prototype.controlPoints = function() {
    if ( !this.curves.length ) {
      return [];
    }

    // Except for the first curve, we only want the last three control points.
    return this.curves.reduce(function( array, curve ) {
      return array.concat( curve.controlPoints().slice(1) );
    }, [ this.curves[0].p0 ] );
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
    var prev = this.curves[ index - 1 ],
        next = this.curves[ index ];

    if ( prev ) {
      curve.linkTo( prev );
    }

    if ( next ) {
      next.unlink();
      next.linkTo( curve );
    }

    this.curves.splice( index, 0, curve );
  };

  BezierPath.prototype.removeAt = function( index ) {
    if ( 0 > index || index > this.curves.length - 1 ) {
      return;
    }

    var prev = this.curves[ index - 1 ],
        curr = this.curves[ index ],
        next = this.curves[ index + 1 ];

    if ( next ) {
      next.unlink();
    }

    if ( prev ) {
      curr.unlink();

      if ( next ) {
        next.linkTo( prev );
      }
    }

    this.curves.splice( index, 1 );
  };

  BezierPath.prototype.remove = function( curve ) {
    var index = this.curves.indexOf( curve );
    if ( index !== -1 ) {
      this.removeAt( index );
    }
  };

  return BezierPath;

}) ();
