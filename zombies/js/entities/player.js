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
  }

  Player.prototype = new Character();
  Player.prototype.constructor = Player;

  Player.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.player.color;
    ctx.fillRect( this.x - 3, this.y - 3, this.width + 7, this.height + 7 );
  };

  Player.prototype.update = function( dt ) {
    var dx = 0,
        dy = 0;

    dx += Input.keys[ 65 ] ? -1 : 0; // A.
    dx += Input.keys[ 68 ] ?  1 : 0; // D.

    dy += Input.keys[ 87 ] ? -1 : 0; // W.
    dy += Input.keys[ 83 ] ?  1 : 0; // S.

    this.vx = dx * 30;
    this.vy = dy * 30;

    Character.prototype.update.call( this, dt );

    // Start shooting.
    var bx = 0,
        by = 0;

    bx += Input.keys[ 37 ] ? -1 : 0; // Left.
    bx += Input.keys[ 39 ] ?  1 : 0; // Right.

    by += Input.keys[ 38 ] ? -1 : 0; // Top.
    by += Input.keys[ 40 ] ?  1 : 0;  // Bottom.

    if ( !bx && !by || !this.canFire ) {
      return;
    }

    this.canFire = false;
    setTimeout(function() {
      this.canFire = true;
    }.bind( this ), config.player.frequency );

    bx *= 200;
    by *= 200;

    Game.projectiles.push( new Bullet( this.x, this.y, bx, by ) );
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
