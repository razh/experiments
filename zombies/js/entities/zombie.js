/*globals define*/
define([
  'game',
  'config',
  'math/geometry',
  'entities/character'
], function( Game, config, Geometry, Character ) {
  'use strict';

  function Zombie( x, y ) {
    Character.call( this, x, y );
    this.speed = ( Math.random() + 0.5 ) * config.zombie.speed;
  }

  Zombie.prototype = new Character();
  Zombie.prototype.constructor = Zombie;

  Zombie.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    var radius = config.zombie.radius,
        diameter = 2 * radius,
        radiusSquared = radius * radius;

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    var civiliansInRange = Game.civiliansQuadtree.retrieve(
      x - radius,
      y - radius,
      diameter, diameter
    );

    civiliansInRange.forEach(function( civilian ) {
      currDistanceSquared = Geometry.distanceSquared( x, y, civilian.x, civilian.y );
      if ( currDistanceSquared < radiusSquared &&
           currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = civilian;
      }
    });

    if ( Game.player ) {
      currDistanceSquared = Geometry.distanceSquared( x, y, Game.player.x, Game.player.y );
      if ( currDistanceSquared < radiusSquared &&
           currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = Game.player;
      }
    }

    if ( minDistanceSquared < 1 ) {
      min.infect();
    } else {
      var angle;
      if ( min ) {
        angle = Geometry.angleTo( x, y, min.x, min.y );
      } else {
        angle = Math.random() * Geometry.PI2;
      }

      this.vx = Math.cos( angle ) * this.speed;
      this.vy = Math.sin( angle ) * this.speed;
    }

    return civiliansInRange.length;
  };

  return Zombie;
});
