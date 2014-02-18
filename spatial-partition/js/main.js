/*exported context, update, draw, drawRect, init*/
'use strict';

/**
 * Generic methods and variables to test out various spatial partitioning
 * data structures.
 *
 * Globals:
 *   canvas, context,
 *   points,
 *   update, draw, init,
 *   rect, drawRect
 */

var PI2 = 2 * Math.PI;
var pointSpeed = 100;

var canvas  = document.getElementById( 'canvas' ),
    context = canvas.getContext( '2d' );

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var prevTime = Date.now(),
    currTime = prevTime;

var points  = [];

function randomInt( min, max ) {
  return Math.round( min + Math.random() * ( max - min ) );
}

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

function Rect( x, y, width, height ) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
}

Rect.prototype.draw = function( ctx ) {
  ctx.rect( this.x, this.y, this.width, this.height );
};

Rect.prototype.contains = function( x, y ) {
  return this.x <= x && x <= this.x + this.width &&
         this.y <= y && y <= this.y + this.height;
};

function update() {
  currTime = Date.now();
  var dt = currTime - prevTime;
  prevTime = currTime;

  // Limit maximum frame time.
  if ( dt > 1e2 ) {
    dt = 1e2;
  }

  // Milliseconds to seconds.
  dt *= 1e-3;

  points.forEach(function( point ) {
    point.update( dt );
  });
}

// Bounding box determined by mouse position.
var rect = new Rect( 200, 200, 100, 100 );

function drawRect( ctx ) {
  // Rectangle.
  ctx.beginPath();
  rect.draw( ctx );
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'yellow';
  ctx.stroke();
}

function draw( ctx ) {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );

  ctx.font = '12pt monospace';

  // Points.
  ctx.beginPath();

  points.forEach(function( point ) {
    point.draw( ctx );
  });

  ctx.fillStyle = 'white';
  ctx.fill();
}

function init() {
  var pointCount = 1000;
  while ( pointCount-- ) {
    points.push( new Point( randomInt( 0, canvas.width ), randomInt( 0, canvas.height ) ) );
  }
}

(function() {
  var mouseDown = false;

  function rectPosition( x, y ) {
    rect.x = x - 0.5 * rect.width;
    rect.y = y - 0.5 * rect.height;
  }

  function onMouseDown() {
    mouseDown = true;
  }

  function onMouseMove( event ) {
    if ( mouseDown ) {
      rectPosition( event.pageX, event.pageY );
    }
  }

  function onMouseUp() {
    mouseDown = false;
  }

  function onTouch( event ) {
    event.preventDefault();
    rectPosition( event.touches[0].pageX, event.touches[0].pageY );
  }

  if ( typeof window.ontouchstart !== 'undefined' ) {
    canvas.addEventListener( 'touchstart', onTouch );
    canvas.addEventListener( 'touchmove', onTouch );
  } else {
    canvas.addEventListener( 'mousedown', onMouseDown );
    canvas.addEventListener( 'mousemove', onMouseMove );
    canvas.addEventListener( 'mouseup', onMouseUp );
  }
}) ();
