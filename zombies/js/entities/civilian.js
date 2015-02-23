/*global Game, config, Geometry, Character, Zombie*/
/*exported Civilian*/
var Civilian = (function() {
  'use strict';

  function Civilian( x, y ) {
    Character.call( this, x, y );
    this.speed = ( Math.random() + 0.5 ) * config.civilian.speed;
  }

  Civilian.prototype = new Character();
  Civilian.prototype.constructor = Civilian;

  Civilian.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    var radius = config.civilian.radius,
        diameter = 2 * radius,
        radiusSquared = radius * radius;

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    var zombiesInRange = Game.zombiesQuadtree.retrieve(
      x - radius,
      y - radius,
      diameter, diameter
    );

    zombiesInRange.forEach(function( zombie ) {
      currDistanceSquared = Geometry.distanceSquared( x, y, zombie.x, zombie.y );
      if ( currDistanceSquared < radiusSquared &&
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

    return zombiesInRange.length;
  };

  Civilian.prototype.infect = function() {
    var index = Game.civilians.indexOf( this );
    if ( index !== -1 ) {
      Game.civilians.splice( index, 1 );
      Game.zombies.push( new Zombie( this.x, this.y ) );
    }
  };

  return Civilian;
}) ();
