/*globals define*/
define([
  'level/level',
  'data',
  'math/geometry'
], function( Level, Data, Geometry ) {
  'use strict';

  console.log( 'An implementation of Amit Patel\'s 2d visibility algorithm.' );
  console.log( 'http://www.redblobgames.com/articles/visibility/' );

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  var prevTime = Date.now(),
      currTime,
      running = true;

  var level = new Level();

  var mouse = {
    x: 200,
    y: 200
  };

  var size = 400,
      margin = 20;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Resize to everything into window.
  size = Math.min( 400, canvas.width, canvas.height );

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    level.draw( ctx );

    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.arc( level.light.x, level.light.y, 5, 0, Geometry.PI2 );
    ctx.fill();

    ctx.beginPath();
    var x0, y0, x1, y1;
    for ( var i = 0, il = level.output.length; i < il; i += 2 ) {
      x0 = level.output[i].x;
      y0 = level.output[i].y;
      x1 = level.output[ i + 1 ].x;
      y1 = level.output[ i + 1 ].y;

      ctx.moveTo( level.light.x, level.light.y );
      ctx.lineTo( x0, y0 );
      ctx.lineTo( x1, y1 );
      ctx.lineTo( level.light.x, level.light.y );
    }

    ctx.fillStyle = 'rgba(255, 255, 224, 0.4)';
    ctx.fill();
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    level.lightPosition( mouse.x, mouse.y );
    level.sweep( Math.PI );
  }

  /**
   * Remaps level coordinates to fit within the given viewport dimensions.
   */
  function resizeLevel( walls, xmin, ymin, xmax, ymax ) {
    var aabb = Geometry.wallsAABB( walls );

    // Determine major axis.
    var horz = ( aabb.xmax - aabb.xmin ) > ( aabb.ymax - aabb.ymin );

    var amin, amax, bmin, bmax;
    if ( horz ) {
      amin = aabb.xmin;
      amax = aabb.xmax;
      bmin = xmin;
      bmax = xmax;
    } else {
      amin = aabb.ymin;
      amax = aabb.ymax;
      bmin = ymin;
      bmax = ymax;
    }

    // Remap coordinates.
    var mapViewport = Geometry.mapInterval.bind(
      Geometry,
      amin, amax,
      bmin, bmax
    );

    return walls.map(function( wall ) {
      return wall.map( mapViewport );
    });
  }

  function init() {
    var min = margin,
        max = size - margin;

    var walls = resizeLevel( Data.mazeWalls, min, min, max, max );
    level.load( size, margin, [], walls );
    tick();
  }

  function onMouse( event ) {
    var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;

    mouse.x = Geometry.limit( x, margin + 1e-2, size - margin - 1e-2 );
    mouse.y = Geometry.limit( y, margin + 1e-2, size - margin - 1e-2 );
  }

  function onTouch( event ) {
    onMouse( event.touches[0] );
  }

  if ( 'ontouchstart' in window ) {
    canvas.addEventListener( 'touchstart', onTouch );

    canvas.addEventListener( 'touchmove', function( event ) {
      event.preventDefault();
      onTouch( event );
    });
  } else {
    canvas.addEventListener( 'mousemove', onMouse );
  }

  document.addEventListener( 'keydown', function( event ) {
    // ESC.
    if ( event.which === 27 ) {
      running = false;
    }

    // Space.
    if ( event.which === 32 ) {
      running = true;
      tick();
    }
  });

  window.addEventListener( 'blur', function() {
    running = false;
  });

  init();
});
