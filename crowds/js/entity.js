/*global Geometry*/
/*exported Entity*/
var Entity = (function() {
  'use strict';

  function Entity( x, y ) {
    this.x = x || 0;
    this.y = y || 0;

    this.vx = 0;
    this.vy = 0;
  }

  Entity.prototype.draw = function( ctx, radius ) {
    var angle = Math.atan2( this.vy, this.vx );

    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( angle );

    ctx.moveTo( 0, 0 );
    ctx.arc( 0, 0, radius, 0, Geometry.PI2 );

    ctx.restore();
  };

  return Entity;

}) ();
