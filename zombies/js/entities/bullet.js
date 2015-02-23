/*global Game, config, Geometry, Entity*/
/*exported Bullet*/
var Bullet = (function() {
  'use strict';

  function Bullet( x, y, vx, vy ) {
    Entity.call( this, x, y, 1, 1 );
    this.vx = vx || 0;
    this.vy = vy || 0;

    this.timeout = setTimeout(function() {
      this.remove();
    }.bind( this ), config.bullet.lifetime );
  }

  Bullet.prototype = new Entity();
  Bullet.prototype.constructor = Bullet;

  Bullet.prototype.remove = function() {
    clearTimeout( this.timeout );

    var index = Game.bullets.indexOf( this );
    if ( index !== -1 ) {
      Game.bullets.splice( index, 1 );
    }
  };

  Bullet.prototype.update = function( dt ) {
    Entity.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

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

    var index;
    if ( min && minDistanceSquared < 4 ) {
      index = Game.zombies.indexOf( min );
      if ( index !== -1 ) {
        Game.zombies.splice( index, 1 );
        this.remove();
      }
    }
  };

  return Bullet;
}) ();
