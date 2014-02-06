(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;

  function Entity( x, y ) {
    this.x = x || 0;
    this.y = y || 0;

    this.angle = 0;
  }

  Entity.prototype.update = function() {};
  Entity.prototype.draw = function() {};

  function PhysicsEntity( x, y ) {
    Entity.call( this, x, y );

    // Velocity.
    this.vx = 0;
    this.vy = 0;

    // Acceleration.
    this.ax = 0;
    this.ay = 0;

    // Angular velocity.
    this.va = 0;

    // Previous position.
    this.px = this.x;
    this.py = this.y;
  }

  PhysicsEntity.prototype = Object.create( Entity.prototype );
  PhysicsEntity.prototype.constructor = PhysicsEntity;

  PhysicsEntity.prototype.update = function( dt ) {
    this.px = this.x;
    this.py = this.y;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.angle += this.va * dt;
  };

  function Soldier( x, y ) {
    PhysicsEntity.call( this, x, y );
  }

  Soldier.prototype = Object.create( PhysicsEntity.prototype );
  Soldier.prototype.constructor = Soldier;

  Soldier.prototype.draw = function( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( -this.angle );

    ctx.beginPath();
    ctx.moveTo( 0, 0 );
    ctx.arc( 0, 0, 5, 0, PI2 );
    ctx.closePath();

    ctx.restore();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  };

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
    var game = Game.instance = new Game();
    document.body.appendChild( game.canvas );

    document.addEventListener( 'keydown', function( event ) {
      // Space.
      if ( event.which === 32 ) {
        if ( game.running ) {
          // Pause.
          game.running = false;
        } else {
          // Play.
          game.running = true;
          tick();
        }
      }
    });

    var count = 300;
    var soldier;
    var x, y;
    var speed, angle;
    while ( count > 0 ) {
      x = Math.round( Math.random() * window.innerWidth );
      y = Math.round( Math.random() * window.innerHeight );
      soldier = new Soldier( x, y );

      // Set soldier properties.
      speed = 50 + Math.random() * 50;
      angle = Math.random() * PI2;
      soldier.angle = angle;
      soldier.vx = speed * Math.cos( -angle );
      soldier.vy = speed * Math.sin( -angle );

      game.add( soldier );
      count--;
    }

    // Tick once.
    console.time( 'tick' );
    game.tick();
    game.running = false;
    console.timeEnd( 'tick' );

  }) ();
}) ( window, document );
