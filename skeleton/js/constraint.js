/*globals define*/
define([
  'math/geometry'
], function( Geometry ) {
  'use strict';

  function Constraint( p0, p1 ) {
    this.p0 = p0;
    this.p1 = p1;

    this.length = Geometry.distance( this.p0.x, this.p0.y, this.p1.x, this.p1.y );
  }

  Constraint.prototype.draw = function( ctx ) {
    ctx.moveTo( this.p0.x, this.p0.y );
    ctx.lineTo( this.p1.x, this.p1.y );
  };

  Constraint.prototype.resolve = function() {
    var distance = Geometry.distance( this.p0.x, this.p0.y, this.p1.x, this.p1.y );

    var difference = ( distance - this.length ) / distance;

    var px = ( this.p1.x - this.p0.x ) * difference * 0.5,
        py = ( this.p1.y - this.p0.y ) * difference * 0.5;

    this.p0.x += px;
    this.p0.y += py;
    this.p1.x -= px;
    this.p1.y -= py;
  };

  return Constraint;
});
