/*globals define*/
define([
  'game',
  'config',
  'math/geometry',
  'entities/entity'
], function( Game, config, Geometry, Entity ) {
  'use strict';

  function Bullet( x, y, vx, vy ) {
    Entity.call( this, x, y, 1, 1 );
    this.vx = vx || 0;
    this.vy = vy || 0;
  }

  Bullet.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.bullet.color;
    ctx.fillRect( this.x, this.y, this.width, this.height );
  };

  Bullet.prototype.update = function( dt ) {
    Entity.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    var index;
    if ( x === config.padding || x === Game.canvas.width  - config.padding ||
         y === config.padding || y === Game.canvas.height - config.padding ) {
      index = Game.projectiles.indexOf( this );
      if ( index !== -1 ) {
        Game.projectiles.splice( index, 1 );
      }
    }

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    var zombiesInRange = Game.zombiesQuadtree.retrieve( x - 2, y - 2, 4, 4 );

    zombiesInRange.forEach(function( zombie ) {
      currDistanceSquared = Geometry.distanceSquared( x, y, zombie.x, zombie.y );
      if ( currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = zombie;
      }
    });

    if ( min && minDistanceSquared < 4 ) {
      index = Game.zombies.indexOf( min );
      if ( index !== -1 ) {
        Game.zombies.splice( index, 1 );

        index = Game.projectiles.indexOf( this );
        if ( index !== -1 ) {
          Game.projectiles.splice( index, 1 );
        }
      }
    }
  };

  return Bullet;
});
