(function( window, document, undefined ) {
  'use strict';

  var TWO_PI = 2 * Math.PI;
  var HALF_PI = 0.5 * Math.PI;

  var mouse = {
    x: 0,
    y: 0
  };

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  /**
   * Returns a number in [-1, +1).
   */
  function signedRandom() {
    return Math.random() * 2 - 1;
  }

  // Similar to toxiclibs' AttractionBehavior.
  function AttractionBehavior( attractor, radius, strength, jitter ) {
    this.attractor = attractor || { x: 0, y: 0 };
    this.radius = radius || 0;
    this.strength = strength || 0;
    this.jitter = jitter || 0;
  }

  AttractionBehavior.prototype.applyBehavior = function( dt, target ) {
    var dx = this.attractor.x - target.x,
        dy = this.attractor.y - target.y;

    if ( !dx && !dy ) {
      return;
    }

    var radiusSquared = this.radius * this.radius;
    var distanceSquared = dx * dx + dy * dy;
    var distanceInverse;
    // Force.
    var fx, fy;
    // Relative distance from attactor.
    var intensity;
    if ( distanceSquared < radiusSquared ) {
      // Normalize.
      intensity = 1 - distanceSquared / radiusSquared;
      distanceInverse = 1 / Math.sqrt( distanceSquared );
      fx = dx * distanceInverse * intensity * this.strength;
      fy = dy * distanceInverse * intensity * this.strength;

      target.vx += fx * dt;
      target.vy += fy * dt;
    }
  };

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

    this.attacking = false;
  }

  Soldier.prototype = Object.create( PhysicsEntity.prototype );
  Soldier.prototype.constructor = Soldier;

  Soldier.prototype.draw = function( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( -this.angle );

    ctx.beginPath();
    ctx.moveTo( 0, 0 );
    ctx.arc( 0, 0, 5, 0, TWO_PI );
    ctx.closePath();

    if ( this.attacking ) {
      ctx.stroke();

      ctx.beginPath();
      ctx.arc( 0, 0, 12, -0.5 * HALF_PI, 0.5 * HALF_PI );
      ctx.stroke();
    }

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
    this.behaviors = [];

    this.removed = [];

    this.debug = {};
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

    this.behaviors.forEach(function( behavior ) {
      this.entities.forEach(function( entity ) {
        behavior.applyBehavior( dt, entity );
      });
    }.bind( this ));

    var width  = this.canvas.width,
        height = this.canvas.height;

    this.entities.forEach(function( entity ) {
      this.behaviors.forEach(function( behavior ) {
        behavior.applyBehavior( dt, entity );
      });

      entity.update( dt );
      entity.x = clamp( entity.x, 0, width );
      entity.y = clamp( entity.y, 0, height );
    }.bind( this ));

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


    this.debug.x = this.entities[0].x;
    this.debug.y = this.entities[0].y;

    ctx.fillStyle = 'white';
    ctx.font = '40px "Helvetica Neue"';
    ctx.fillText( this.debug.x.toFixed(2) + ', ' + this.debug.y.toFixed(2), 20, 40 );
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

    window.addEventListener( 'mousemove', function( event ) {
      mouse.x = event.pageX - game.canvas.offsetLeft;
      mouse.y = event.pageY - game.canvas.offsetTop;
    });

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
      angle = Math.random() * TWO_PI;
      soldier.angle = angle;
      soldier.vx = speed * Math.cos( -angle );
      soldier.vy = speed * Math.sin( -angle );
      soldier.attacking = Math.random() < 0.75 ? false : true;

      game.add( soldier );
      count--;
    }

    game.behaviors.push( new AttractionBehavior( mouse, 500, 1000, 0.01 ) );

    // Tick once.
    console.time( 'tick' );
    game.tick();
    game.running = false;
    console.timeEnd( 'tick' );

  }) ();
}) ( window, document );
