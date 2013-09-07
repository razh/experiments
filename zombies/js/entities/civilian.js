/*globals define*/
define([
  'game',
  'config',
  'math/geometry',
  'entities/character',
  'entities/zombie'
], function( Game, config, Geometry, Character, Zombie ) {
  'use strict';

  function Civilian( x, y ) {
    Character.call( this, x, y );
    this.speed = ( Math.random() + 0.5 ) * config.civilian.speed;
  }

  Civilian.prototype = new Character();
  Civilian.prototype.constructor = Civilian;

  Civilian.prototype.draw = function( ctx ) {
    ctx.rect( this.x, this.y, this.width, this.height );
  };

  Civilian.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    Game.zombies.forEach(function( zombie ) {
      currDistanceSquared = Geometry.distanceSquared( x, y, zombie.x, zombie.y );
      if ( currDistanceSquared < config.civilian.radiusSquared &&
           currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = zombie;
      }
    });

    var angle;
    if ( min ) {
      angle = Geometry.angleTo( x, y, min.x, min.y ) + Math.PI;
    } else {
      angle = Math.random() * Geometry.PI2;
    }

    this.vx = Math.cos( angle ) * this.speed;
    this.vy = Math.sin( angle ) * this.speed;
  };

  Civilian.prototype.infect = function() {
    var index = Game.civilians.indexOf( this );
    if ( index !== -1 ) {
      Game.civilians.splice( index, 1 );
      Game.zombies.push( new Zombie( this.x, this.y ) );
    }
  };

  return Civilian;
});
