/*globals define*/
define([
  'game',
  'input',
  'math/geometry',
  'entities/civilian',
  'entities/zombie',
  'entities/player'
], function( Game, Input, Geometry, Civilian, Zombie, Player ) {
  'use strict';

  function init() {
    var width  = Game.canvas.width,
        height = Game.canvas.height;

    Game.player = new Player( Geometry.randomInt( 0, width ), Geometry.randomInt( 0, height ) );

    var civilianCount = 2000;
    var i;
    for ( i = 0; i < civilianCount; i++ ) {
      Game.civilians.push( new Civilian( Geometry.randomInt( 0, width ), Geometry.randomInt( 0, height ) ) );
    }

    var zombieCount = 20;
    for ( i = 0; i < zombieCount; i++ ) {
      Game.zombies.push( new Zombie( Geometry.randomInt( 0, width ), Geometry.randomInt( 0, height ) ) );
    }

    tick();
  }

  function tick() {
    // ESC.
    if ( Input.keys[ 27 ] ) {
      return;
    }

    Game.update();
    Game.draw( Game.context );
    window.requestAnimationFrame( tick );
  }

  document.addEventListener( 'keydown', Input.onKeyDown );
  document.addEventListener( 'keyup', Input.onKeyUp );

  init();
});
