/*globals define*/
define([
  'input',
  'constraint',
  'math/geometry'
], function( Input, Constraint, Geometry ) {
  'use strict';

  function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;

    // Previous.
    this.px = this.x;
    this.py = this.y;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    this.pinX = null;
    this.pinY = null;

    this.constraints = [];
  }

  Point.prototype.draw = function( ctx ) {
    ctx.rect( this.x - 0.5, this.y - 0.5, 1, 1 );

    this.constraints.forEach(function( constraint ) {
      constraint.draw( ctx );
    });
  };

  Point.prototype.attach = function( point ) {
    this.constraints.push( new Constraint( this, point ) );
  };

  Point.prototype.update = function( dt ) {
    if ( Input.mouse.down ) {
      var distanceSquared = Geometry.distanceSquared( this.x, this.y, Input.mouse.x, Input.mouse.y );
      if ( distanceSquared < 10 * 10 ) {
        this.px = this.x - ( Input.mouse.x - Input.mouse.px ) * 1.8;
        this.py = this.y - ( Input.mouse.y - Input.mouse.py ) * 1.8;
      }
    }

    this.force( 0, 1200 );

    var dtSquared = dt * dt;

    var x = this.x + 0.99 * ( this.x - this.px ) + 0.5 * this.vx * dtSquared,
        y = this.y + 0.99 * ( this.y - this.py ) + 0.5 * this.vy * dtSquared;

    this.px = this.x;
    this.py = this.y;

    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;
  };

  Point.prototype.force = function( x, y ) {
    this.vx += x;
    this.vy += y;
  };

  Point.prototype.resolve = function() {
    if ( this.pinX !== null && this.pinY !== null ) {
      this.x = this.pinX;
      this.y = this.pinY;
      return;
    }

    this.constraints.forEach(function( constraint ) {
      constraint.resolve();
    });
  };

  Point.prototype.pin = function( x, y ) {
    this.pinX = x;
    this.pinY = y;
  };

  return Point;
});
