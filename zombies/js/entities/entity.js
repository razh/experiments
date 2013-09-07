/*globals define*/
define([
  'game',
  'config'
], function( Game, config ) {
  'use strict';

  function Entity( x, y, width, height  ) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;

    this.vx = 0;
    this.vy = 0;
  }

  Entity.prototype.update = function( dt ) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if ( 0 > this.x ) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if ( this.x > Game.canvas.width ) {
      this.x = Game.canvas.width;
      this.vx = -this.vx;
    }

    if ( 0 > this.y ) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if ( this.y > Game.canvas.height ) {
      this.y = Game.canvas.height;
      this.vy = -this.vy;
    }
  };

  Entity.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.entity.color;
    ctx.fillRect( this.x - 0.5 * this.width, this.y - 0.5 * this.height, this.width, this.height );
  };

  return Entity;
});
