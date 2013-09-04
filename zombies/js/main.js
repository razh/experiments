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
      radius: 10
    },
    zombie: {
      color: 'rgba(255, 0, 0, 1.0)',
      radius: 10
    },
    civilian: {
      color: 'rgba(255, 255, 255, 1.0)',
      radius: 10
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

  var zombieHeatMap = document.createElement( 'canvas' ),
      civilianHeatMap = document.createElement( 'canvas' );

  var zombieHeatMapCtx = zombieHeatMap.getContext( '2d' ),
      civilianHeatMapCtx = civilianHeatMap.getContext( '2d' );

  zombieHeatMap.width = canvas.width;
  zombieHeatMap.height = canvas.height;

  civilianHeatMap.width = canvas.width;
  civilianHeatMap.height = canvas.height;

  // Draw heat map template pattern
  var heatMapTemplate = document.createElement( 'canvas' ),
      heatMapTemplateCtx = heatMapTemplate.getContext( '2d' );

  var heatMapRadius = 25,
      heatMapSize = 2 * heatMapRadius;

  heatMapTemplate.width = heatMapSize;
  heatMapTemplate.height = heatMapSize;

  var heatMapGrad = heatMapTemplateCtx.createRadialGradient(
    heatMapRadius, heatMapRadius, 1,
    heatMapRadius, heatMapRadius, heatMapRadius
  );

  heatMapGrad.addColorStop( 0, 'white' );
  heatMapGrad.addColorStop( 1, 'transparent' );

  heatMapTemplateCtx.fillStyle = heatMapGrad;
  heatMapTemplateCtx.fillRect( 0, 0, heatMapSize, heatMapSize );

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

    ctx.globalAlpha = 0.2;
    ctx.drawImage( civilianHeatMap, 0, 0, canvas.width, canvas.height );
    ctx.globalAlpha = 1.0;

    projectiles.forEach(function( projectile ) {
      projectile.draw( ctx );
    });

    zombies.forEach(function( zombie ) {
      zombie.draw( ctx );
    });

    civilians.forEach(function( civilian ) {
      civilian.draw( ctx );
    });

    player.draw( ctx );
  }

  function updateHeatMaps() {
    zombieHeatMapCtx.fillStyle = 'black';
    zombieHeatMapCtx.fillRect( 0, 0, zombieHeatMap.width, zombieHeatMap.height );

    civilianHeatMapCtx.fillStyle = 'black';
    civilianHeatMapCtx.fillRect( 0, 0, civilianHeatMap.width, civilianHeatMap.height );

    var x, y;
    zombies.forEach(function( zombie ) {
      x = zombie.x;
      y = zombie.y;

      zombieHeatMapCtx.drawImage(
        heatMapTemplate,
        x - heatMapRadius, y - heatMapRadius,
        heatMapSize, heatMapSize
      );
    });

    civilians.forEach(function( civilian ) {
      x = civilian.x;
      y = civilian.y;

      civilianHeatMapCtx.drawImage(
        heatMapTemplate,
        x - heatMapRadius, y - heatMapRadius,
        heatMapSize, heatMapSize
      );
    });
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    updateHeatMaps();

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
    }

    if ( this.x > canvas.width ) {
      this.x = canvas.width;
    }

    if ( 0 > this.y ) {
      this.y = 0;
    }

    if ( this.y > canvas.height ) {
      this.y = canvas.height;
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

    if ( this.x === 0 || this.x === canvas.width ||
         this.y === 0 || this.y === canvas.height ) {
      var index = projectiles.indexOf( this );
      if ( index !== -1 ) {
        projectiles.splice( index, 1 );
      }
    }
  };

  /**
   * Character.
   */
  function Character( x, y ) {
    Entity.call( this, x, y, 2, 2 );
  }

  Character.prototype = new Entity();
  Character.prototype.constructor = Character;

  /**
   * Zombie.
   */
  function Zombie( x, y ) {
    Character.call( this, x, y );
  }

  Zombie.prototype = new Character();
  Zombie.prototype.constructor = Zombie;

  Zombie.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.zombie.color;
    ctx.fillRect( this.x - 2, this.y - 2, this.width + 4, this.height + 4 );
  };

  Zombie.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );
    var data = civilianHeatMapCtx.getImageData( this.x - 1, this.y - 1, 3, 3 ).data;
    // This is super hacky.
    var topLeft     = data[ 0 * 4 ];
    var top         = data[ 1 * 4 ];
    var topRight    = data[ 2 * 4 ];
    var left        = data[ 3 * 4 ];
    var center      = data[ 4 * 4 ];
    var right       = data[ 5 * 4 ];
    var bottomLeft  = data[ 6 * 4 ];
    var bottom      = data[ 7 * 4 ];
    var bottomRight = data[ 8 * 4 ];

    var dx = topLeft * -1 + left * -1 + bottomLeft * -1 + topRight * 1 + right * 1 + bottomRight * 1;
    var dy = topLeft * -1 + top * -1 + topRight * -1 + bottomLeft * 1 + bottom * 1 + bottomRight * 1;

    if ( dx === 0 ) {
      dx = Math.random() * 50 - 25;
    }

    if ( dy === 0 ) {
      dy = Math.random() * 50 - 25;
    }

    this.vx = dx;
    this.vy = dy;
  };


  /**
   * Civilian.
   */
  function Civilian( x, y ) {
    Character.call( this, x, y );
  }

  Civilian.prototype = new Character();
  Civilian.prototype.constructor = Civilian;

  Civilian.prototype.draw = function( ctx ) {
    ctx.fillStyle = config.civilian.color;
    ctx.fillRect( this.x, this.y, this.width, this.height );
  };

  Civilian.prototype.update = function( dt ) {
    Character.prototype.update.call( this, dt );
    this.vx = Math.random() * 100 - 50;
    this.vy = Math.random() * 100 - 50;
  };


  /**
   * Zombie.
   */
  function Player( x, y ) {
    Character.call( this, x, y );
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

    if ( !bx && !by ) {
      return;
    }

    bx *= 200;
    by *= 200;

    projectiles.push( new Bullet( this.x, this.y, bx, by ) );
  };

  function randomInt( min, max ) {
    return Math.round( min + Math.random() * ( max - min ) );
  }

  function init() {
    var width  = canvas.width,
        height = canvas.height;

    var civilianCount = 100;
    var i;
    for ( i = 0; i < civilianCount; i++ ) {
      civilians.push( new Civilian( randomInt( 0, width ), randomInt( 0, height ) ) );
    }

    var zombieCount = 5;
    for ( i = 0; i < zombieCount; i++ ) {
      zombies.push( new Zombie( randomInt( 0, width ), randomInt( 0, height ) ) );
    }

    player = new Player( randomInt( 0, width ), randomInt( 0, height ) );

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
