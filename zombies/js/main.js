(function( window, document ) {
  var PI2 = 2 * Math.PI;

  var canvas = document.getElementById( 'canvas' );
  var context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context.fillRect( 0, 0, canvas.width, canvas.height );

  var config = {
    player: {
      color: 'rgba(0, 255, 0, 1.0)',
      health: 100,
      speed: 15,
      frequency: 1000 / 10, // Number of ms to fire n bullets/second.
      hitFrequency: 1000 / 40 // Number of ms between player injuries.
    },
    zombie: {
      color: 'rgba(255, 0, 0, 1.0)',
      speed: 20,
      radiusSquared: 75 * 75,
      health: 10
    },
    civilian: {
      color: 'rgba(255, 255, 255, 1.0)',
      radiusSquared: 100 * 100,
      speed: 25
    },
    entity: {
      color: 'rgba(255, 0, 255, 1.0)'
    },
    bullet: {
      color: 'rgba(255, 255, 0, 1.0)'
    }
  };

  var keys = {};

  var zombies     = [],
      civilians   = [],
      projectiles = [],
      player;

  var prevTime = Date.now(),
      currTime,
      running = true;

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    projectiles.forEach(function( projectile ) {
      projectile.draw( ctx );
    });

    ctx.beginPath();
    zombies.forEach(function( zombie ) {
      zombie.draw( ctx );
    });
    ctx.fillStyle = config.zombie.color;
    ctx.fill();

    ctx.beginPath();
    civilians.forEach(function( civilian ) {
      if ( !( civilian instanceof Player ) ) {
        civilian.draw( ctx );
      }
    });
    ctx.fillStyle = config.civilian.color;
    ctx.fill();

    player.draw( ctx );

    ctx.font = '14px Helvetica, Arial';
    ctx.fillStyle = 'white';
    ctx.fillText( player.health, 20, 20 );
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    projectiles.forEach(function( projectile ) {
      projectile.update( dt );
    });

    zombies.forEach(function( zombie ) {
      zombie.update( dt );
    });

    civilians.forEach(function( civilian ) {
      civilian.update( dt );
    });

    player.update( dt );
  }

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function distance( x0, y0, x1, y1 ) {
    return Math.sqrt( distanceSquared( x0, y0, x1, y1 ) );
  }

  /**
   * Returns the angle that a character at (x0, y0) would need to travel along
   * to reach (x1, y1);
   */
  function angleTo( x0, y0, x1, y1 ) {
    return Math.atan2( y1 - y0, x1 - x0 );
  }

  /**
   * Entity.
   */
  function Entity( x, y, width, height  ) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.width = width || 0.0;
    this.height = height || 0.0;

    this.vx = 0.0;
    this.vy = 0.0;
  }

  Entity.prototype.update = function( dt ) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if ( 0 > this.x ) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if ( this.x > canvas.width ) {
      this.x = canvas.width;
      this.vx = -this.vx;
    }

    if ( 0 > this.y ) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if ( this.y > canvas.height ) {
      this.y = canvas.height;
      this.vy = -this.vy;
    }
  };

  Entity.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.entity.color;
    ctx.fillRect( this.x - 0.5 * this.width, this.y - 0.5 * this.height, this.width, this.height );
  };

  /**
   * Bullet.
   */
  function Bullet( x, y, vx, vy ) {
    Entity.call( this, x, y, 1, 1 );
    this.vx = vx || 0.0;
    this.vy = vy || 0.0;
  }

  Bullet.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.bullet.color;
    ctx.fillRect( this.x, this.y, this.width, this.height );
  };

  Bullet.prototype.update = function( dt ) {
    Entity.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    if ( x === 0 || x === canvas.width ||
         y === 0 || y === canvas.height ) {
      var index = projectiles.indexOf( this );
      if ( index !== -1 ) {
        projectiles.splice( index, 1 );
      }
    }

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    zombies.forEach(function( zombie ) {
      var currDistanceSquared = distanceSquared( x, y, zombie.x, zombie.y );
      if ( currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = zombie;
      }
    });

    if ( min && minDistanceSquared < 4 ) {
      var index = zombies.indexOf( min );
      if ( index !== -1 ) {
        zombies.splice( index, 1 );

        index = projectiles.indexOf( this );
        if ( index !== -1 ) {
          projectiles.splice( index, 1 );
        }
      }
    }
  };

  /**
   * Character.
   */
  function Character( x, y ) {
    Entity.call( this, x, y, 2, 2 );
    this.speed = 0;
  }

  Character.prototype = new Entity();
  Character.prototype.constructor = Character;

  /**
   * Zombie.
   */
  function Zombie( x, y ) {
    Character.call( this, x, y );
    this.speed = ( Math.random() + 0.5 ) * config.zombie.speed;
  }

  Zombie.prototype = new Character();
  Zombie.prototype.constructor = Zombie;

  Zombie.prototype.draw = function( ctx ) {
    ctx.rect( this.x, this.y, this.width, this.height );
  };

  Zombie.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    civilians.forEach(function( civilian ) {
      currDistanceSquared = distanceSquared( x, y, civilian.x, civilian.y );
      if ( currDistanceSquared < config.zombie.radiusSquared &&
           currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = civilian;
      }
    });

    if ( minDistanceSquared < 1 ) {
      min.infect();
    } else {
      var angle;
      if ( min ) {
        angle = angleTo( x, y, min.x, min.y );
      } else {
        angle = Math.random() * PI2;
      }

      this.vx = Math.cos( angle ) * this.speed;
      this.vy = Math.sin( angle ) * this.speed;
    }
  };


  /**
   * Civilian.
   */
  function Civilian( x, y ) {
    Character.call( this, x, y );
    this.speed = ( Math.random() + 0.5 ) * config.civilian.speed;
  }

  Civilian.prototype = new Character();
  Civilian.prototype.constructor = Civilian;

  Civilian.prototype.draw = function( ctx ) {
    ctx.rect( this.x, this.y, this.width, this.height );
  };

  Civilian.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );

    var x = this.x,
        y = this.y;

    var minDistanceSquared = Number.POSITIVE_INFINITY,
        currDistanceSquared,
        min;

    zombies.forEach(function( zombie ) {
      currDistanceSquared = distanceSquared( x, y, zombie.x, zombie.y );
      if ( currDistanceSquared < config.civilian.radiusSquared &&
           currDistanceSquared < minDistanceSquared ) {
        minDistanceSquared = currDistanceSquared;
        min = zombie;
      }
    });

    var angle;
    if ( min ) {
      angle = angleTo( x, y, min.x, min.y ) + Math.PI;
    } else {
      angle = Math.random() * PI2;
    }

    this.vx = Math.cos( angle ) * this.speed;
    this.vy = Math.sin( angle ) * this.speed;
  };

  Civilian.prototype.infect = function() {
    var index = civilians.indexOf( this );
    if ( index !== -1 ) {
      civilians.splice( index, 1 );
      zombies.push( new Zombie( this.x, this.y ) );
    }
  };


  /**
   * Player.
   */
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
    ctx.fillRect( this.x - 2, this.y - 2, this.width + 5, this.height + 5 );
  };

  Player.prototype.update = function( dt ) {
    var dx = 0,
        dy = 0;

    dx += keys[ 65 ] ? -1 : 0; // A.
    dx += keys[ 68 ] ?  1 : 0; // D.

    dy += keys[ 87 ] ? -1 : 0; // W.
    dy += keys[ 83 ] ?  1 : 0; // S.

    this.vx = dx * 30;
    this.vy = dy * 30;

    Character.prototype.update.call( this, dt );

    // Start shooting.
    var bx = 0,
        by = 0;

    bx += keys[ 37 ] ? -1 : 0; // Left.
    bx += keys[ 39 ] ?  1 : 0; // Right.

    by += keys[ 38 ] ? -1 : 0; // Top.
    by += keys[ 40 ] ?  1 : 0;  // Bottom.

    if ( !bx && !by || !this.canFire ) {
      return;
    }

    this.canFire = false;
    setTimeout(function() {
      this.canFire = true;
    }.bind( this ), config.player.frequency );

    bx *= 200;
    by *= 200;

    projectiles.push( new Bullet( this.x, this.y, bx, by ) );
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

  function randomInt( min, max ) {
    return Math.round( min + Math.random() * ( max - min ) );
  }

  function init() {
    var width  = canvas.width,
        height = canvas.height;

    civilians.push( player = new Player( randomInt( 0, width ), randomInt( 0, height ) ) );
    var civilianCount = 500;
    var i;
    for ( i = 0; i < civilianCount; i++ ) {
      civilians.push( new Civilian( randomInt( 0, width ), randomInt( 0, height ) ) );
    }

    var zombieCount = 20;
    for ( i = 0; i < zombieCount; i++ ) {
      zombies.push( new Zombie( randomInt( 0, width ), randomInt( 0, height ) ) );
    }

    tick();
  }

  function onKeyDown( event ) {
    // console.log( event.which );
    keys[ event.which ] = true;
    // ESC.
    if ( event.which === 27 ) {
      running = false;
    }
  }

  function onKeyUp( event ) {
    // console.log( event.which );
    keys[ event.which ] = false;
  }

  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keyup', onKeyUp );

  init();
}) ( window, document );
