/*globals define*/
define([
  'level/level',
  'data',
  'math/point',
  'math/segment'
], function( Level, Data, Point, Segment ) {
  'use strict';

  /**
   * This is an implementation of Amit Patel's 2d visibility algorithm.
   * http://www.redblobgames.com/articles/visibility/
   */
  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var prevTime = Date.now(),
      currTime,
      running = true;

  var level = new Level();

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function tick() {
    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    level.draw( ctx );
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;
  }

  function init() {
    var mazeWalls = Data.mazeWalls;
    level.load( 400, 20, [], mazeWalls );

    tick();
  }

  init();
});
