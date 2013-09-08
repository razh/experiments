/*globals Quadtree*/
(function( window, document, undefined ) {
  'use strict';

  var PI2 = 2 * Math.PI;
  var pointSpeed = 100;

  function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;

    var angle = Math.random() * PI2;
    this.vx = Math.cos( angle ) * pointSpeed;
    this.vy = Math.sin( angle ) * pointSpeed;
  }

  Point.prototype.draw = function( ctx ) {
    ctx.rect( this.x - 1, this.y - 1, 2, 2 );
  };

  Point.prototype.update = function( dt ) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if ( this.x < 0 ) {
      this.x = 0;
      this.vx = -this.vx;
    }

    if ( this.x > canvas.width ) {
      this.x = canvas.width;
      this.vx = -this.vx;
    }

    if ( this.y < 0 ) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if ( this.y > canvas.height ) {
      this.y = canvas.height;
      this.vy = -this.vy;
    }
  };

  Quadtree.prototype.draw = function( ctx ) {
    ctx.beginPath();
    ctx.rect( this.x, this.y, this.size, this.size );

    ctx.strokeStyle = 'red';
    ctx.stroke();

    this.children.forEach(function( child ) {
      child.draw( ctx );
    });
  };

  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var prevTime = Date.now(),
      currTime = prevTime;

  var points = [];
  var quadtree = new Quadtree( 0, 0, Math.max( canvas.width, canvas.height ) );

  function tick() {
    update();
    draw( context );
    window.requestAnimationFrame( tick );
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    points.forEach(function( point ) {
      point.update( dt );
    });

    quadtree.clear();
    quadtree.insertAll( points );
  }

  function draw( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    quadtree.draw( ctx );

    ctx.beginPath();
    points.forEach(function( point ) {
      point.draw( ctx );
    });
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  function randomInt( min, max ) {
    return Math.round( min + Math.random() * ( max - min ) );
  }

  function init() {
    var pointCount = 1000;
    while ( pointCount-- ) {
      points.push( new Point( randomInt( 0, canvas.width ), randomInt( 0, canvas.height ) ) );
    }

    tick();
  }

  init();
}) ( window, document );
