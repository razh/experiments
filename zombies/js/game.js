/*global config, Quadtree*/
/*exported Game*/
var Game = (function() {
  'use strict';

  Quadtree.MIN_SIZE = 128;

  function Game() {
    this.canvas  = document.getElementById( 'canvas' );
    this.context = this.canvas.getContext( '2d' );

    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.zombies   = [];
    this.civilians = [];
    this.bullets   = [];
    this.player    = null;

    var size = Math.max( this.canvas.width, this.canvas.height );
    this.zombiesQuadtree = new Quadtree( 0, 0, size );
    this.civiliansQuadtree = new Quadtree( 0, 0, size );

    this.test = [];

    this.prevTime = Date.now();
    this.currTime = this.prevTime;

    this.debug = {
      comparisons: 0
    };
  }

  Game.instance = new Game();

  Game.prototype.draw = function( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

    ctx.beginPath();
    this.bullets.forEach(function( bullet ) {
      bullet.draw( ctx );
    });
    ctx.fillStyle = config.bullet.color;
    ctx.fill();

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

    ctx.beginPath();
    this.test.forEach(function( test ) {
      test.draw( ctx );
    });
    ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';
    ctx.fill();

    ctx.font = '14px Helvetica, Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText( 'Civilians: ' + this.civilians.length, 100, 20 );

    ctx.fillStyle = 'red';
    ctx.fillText( 'Zombies: ' + this.zombies.length, 200, 20 );

    ctx.fillStyle = 'white';
    var comparisons = this.debug.comparisons,
        totalComparisons = 2 * this.zombies.length * this.civilians.length,
        comparisonRatio = ( comparisons / totalComparisons * 1e2 ).toFixed(2);
    ctx.fillText( 'Comparisons: ' + comparisons + ' / ' + totalComparisons + ' (' + comparisonRatio + '%)', 300, 20 );

    if ( this.player ) {
      this.player.draw( ctx );

      var health = this.player.health;
      ctx.fillStyle = health > 50 ? 'rgb(0, 255, 0)' : ( health > 25 ? 'yellow' : 'red' );
      ctx.fillText( 'Health: ' + health, 10, 20 );
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

    this.zombiesQuadtree.clear();
    this.civiliansQuadtree.clear();

    this.zombiesQuadtree.insertAll( this.zombies );
    this.civiliansQuadtree.insertAll( this.civilians );

    var comparisons = 0;
    this.zombies.forEach(function( zombie ) {
      comparisons += zombie.update( dt );
    });

    this.civilians.forEach(function( civilian ) {
      comparisons += civilian.update( dt );
    });
    this.debug.comparisons = comparisons;

    this.bullets.forEach(function( bullet ) {
      bullet.update( dt );
    });

    if ( this.player ) {
      this.player.update( dt );
    }
  };

  return Game.instance;
}) ();
