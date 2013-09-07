/*globals define*/
define([
  'config'
], function( config ) {
  'use strict';

  function Game() {
    this.canvas  = document.getElementById( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.zombies     = [];
    this.civilians   = [];
    this.projectiles = [];
    this.player      = null;

    this.prevTime = Date.now();
    this.currTime = this.prevTime;
  }

  Game.instance = new Game();

  Game.prototype.draw = function( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

    this.projectiles.forEach(function( projectile ) {
      projectile.draw( ctx );
    });

    ctx.beginPath();
    this.zombies.forEach(function( zombie ) {
      zombie.draw( ctx );
    });
    ctx.fillStyle = config.zombie.color;
    ctx.fill();

    ctx.beginPath();
    this.civilians.forEach(function( civilian ) {
      civilian.draw( ctx );
    });
    ctx.fillStyle = config.civilian.color;
    ctx.fill();

    ctx.font = '14px Helvetica, Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText( this.civilians.length, 100, 20 );

    ctx.fillStyle = 'red';
    ctx.fillText( this.zombies.length, 150, 20 );

    if ( this.player ) {
      this.player.draw( ctx );

      ctx.fillStyle = 'white';
      ctx.fillText( this.player.health, 20, 20 );
    }
  };

  Game.prototype.update = function() {
    this.currTime = Date.now();
    var dt = this.currTime - this.prevTime;
    this.prevTime = this.currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    this.projectiles.forEach(function( projectile ) {
      projectile.update( dt );
    });

    this.zombies.forEach(function( zombie ) {
      zombie.update( dt );
    });

    this.civilians.forEach(function( civilian ) {
      civilian.update( dt );
    });

    if ( this.player ) {
      this.player.update( dt );
    }
  };

  return Game.instance;
});
