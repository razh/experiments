/*globals define*/
define([
  'game',
  'config',
  'input',
  'math/geometry',
  'entities/character',
  'entities/bullet'
], function( Game, config, Input, Geometry, Character, Bullet ) {
  'use strict';

  function Player( x, y ) {
    Character.call( this, x, y );
    this.canFire = true;

    this.health = config.player.health;
    this.living = true;
    this.injured = false;
    this.visible = true;

    document.addEventListener( 'keydown', function( event ) {
      // Space.
      if ( event.which === 32 ) {
        this.visible = !this.visible;
      }
    }.bind( this ));
  }

  Player.prototype = new Character();
  Player.prototype.constructor = Player;

  Player.prototype.draw = function( ctx ) {
    if ( !this.living ) {
      ctx.fillStyle = config.player.deadColor;
    } else if ( this.visible ) {
      ctx.fillStyle = config.player.color;
    } else {
      ctx.fillStyle = config.player.invisibleColor;
    }

    ctx.fillRect( this.x - 3, this.y - 3, this.width + 7, this.height + 7 );
  };

  Player.prototype.update = function( dt ) {
    var dx = 0,
        dy = 0;

    dx += Input.keys[ 65 ] ? -1 : 0; // A.
    dx += Input.keys[ 68 ] ?  1 : 0; // D.

    dy += Input.keys[ 87 ] ? -1 : 0; // W.
    dy += Input.keys[ 83 ] ?  1 : 0; // S.

    this.vx = dx * config.player.speed;
    this.vy = dy * config.player.speed;

    Character.prototype.update.call( this, dt );

    // Start shooting.
    var bx = 0,
        by = 0;

    bx += Input.keys[ 37 ] ? -1 : 0; // Left.
    bx += Input.keys[ 39 ] ?  1 : 0; // Right.

    by += Input.keys[ 38 ] ? -1 : 0; // Top.
    by += Input.keys[ 40 ] ?  1 : 0; // Bottom.

    if ( !bx && !by || !this.canFire ) {
      return;
    }

    this.canFire = false;
    setTimeout(function() {
      this.canFire = true;
    }.bind( this ), config.player.frequency );

    bx *= config.bullet.speed;
    by *= config.bullet.speed;

    Game.bullets.push( new Bullet( this.x, this.y, bx, by ) );
  };

  Player.prototype.infect = function() {
    if ( !this.living ) {
      return;
    }

    if ( !this.injured ) {
      this.health--;
      this.injured = true;

      setTimeout(function() {
        this.injured = false;
      }.bind( this ), config.player.hitFrequency );
    }

    if ( !this.health ) {
      console.log( 'You\'re dead!' );
      this.living = false;
    }
  };

  return Player;
});
