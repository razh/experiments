(function( window, document, undefined ) {
  'use strict';

  function Game() {
    this.canvas = document.createElement( 'canvas' );
    this.ctx    = this.canvas.getContext( '2d' );

    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.prevTime = Date.now();
    this.currTime = this.prevTime;
    this.running = true;

    this.entities = [];

    this.removed = [];
  }

  Game.instance = null;

  Game.prototype.update = function() {
    this.currTime = Date.now();
    var dt = this.currTime - this.prevTime;
    this.prevTime = this.currTime;

    // Limit frame time.
    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Convert milliseconds to seconds.
    dt *= 1e-3;

    this.entities.forEach(function( entity ) {
      entity.update( dt );
    });

    // Clean-up entities removed during this update cycle.
    this.removed.forEach(function( removed ) {
      this.remove( removed );
    }.bind( this ));

    this.removed = [];
  };

  Game.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    this.entities.forEach(function( entity ) {
      entity.draw( ctx );
    });
  };

  Game.prototype.tick = function() {
    if ( !this.running ) {
      return;
    }

    this.update();
    this.draw();
  };

  Game.prototype.add = function( entity ) {
    this.entities.push( entity );
    entity.world = this;
  };

  Game.prototype.remove = function( entity ) {
    var index = this.entities.indexOf( entity );
    if ( index !== -1 ) {
      this.entities.splice( index, 1 );
      entity.world = null;
    }
  };

  function tick() {
    Game.instance.tick();
    window.requestAnimationFrame( tick );
  }

  (function init() {
    Game.instance = new Game();
    document.body.appendChild( Game.instance.canvas );

    document.addEventListener( 'keydown', function( event ) {
      // Space.
      if ( event.which === 32 ) {
        tick();
      }

      // ESC.
      if ( event.which === 27 ) {
        Game.instance.running = false;
      }
    });

  }) ();
}) ( window, document );
