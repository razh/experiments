/*global Game, config*/
/*exported Entity*/
var Entity = (function() {
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

    if ( config.padding > this.x ) {
      this.x = config.padding;
      this.vx = -this.vx;
    }

    if ( this.x > Game.canvas.width - config.padding ) {
      this.x = Game.canvas.width - config.padding;
      this.vx = -this.vx;
    }

    if ( config.padding > this.y ) {
      this.y = config.padding;
      this.vy = -this.vy;
    }

    if ( this.y > Game.canvas.height - config.padding ) {
      this.y = Game.canvas.height - config.padding;
      this.vy = -this.vy;
    }
  };

  Entity.prototype.draw = function( ctx ) {
    ctx.rect( this.x - 0.5 * this.width, this.y - 0.5 * this.height, this.width, this.height );
  };

  return Entity;
}) ();
