(function( window, document, undefined ) {
  'use strict';

  function Game() {
    this.canvas = document.createElement( 'canvas' );
    this.ctx    = this.canvas.getContext( '2d' );

    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  Game.instance = null;

  (function init() {
    Game.instance = new Game();
    document.body.appendChild( this.canvas );
  }) ();
}) ( window, document );
