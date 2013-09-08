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

  Quadtree.prototype.draw = function( ctx ) {
    ctx.rect( this.x, this.y, this.size, this.size );

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

  var points     = [],
      potentials = [],
      actuals    = [];

  var quadtree = new Quadtree( 0, 0, Math.max( canvas.width, canvas.height ) );
  var rect = new Rect( 200, 200, 100, 100 );

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

    potentials = quadtree.retrieve( rect.x, rect.y, rect.width, rect.height );
    actuals = potentials.filter(function( point ) {
      return rect.contains( point.x, point.y );
    });
  }

  var drawing = {
    quadtree: false,
  };

  function draw( ctx ) {
    ctx.fillStyle = 'black';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    if ( drawing.quadtree ) {
      ctx.beginPath();
      quadtree.draw( ctx );
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

    ctx.beginPath();
    points.forEach(function( point ) {
      point.draw( ctx );
    });
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.beginPath();
    potentials.forEach(function( point ) {
      point.draw( ctx );
    });
    ctx.fillStyle = 'yellow';
    ctx.fill();

    ctx.font = '12pt Monaco, Courier';
    ctx.fillText( 'potential: ' + potentials.length, 25, 30 );

    ctx.beginPath();
    rect.draw( ctx );
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();

    ctx.beginPath();
    actuals.forEach(function( point ) {
      point.draw( ctx );
    });
    ctx.fillStyle = 'rgba(0, 255, 0, 1.0)';
    ctx.fill();
    ctx.fillText( 'actual: ' + actuals.length, 175, 30 );
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

  var mouseDown = false;

  function onMouseDown( event ) {
    mouseDown = true;
  }

  function onMouseMove( event ) {
    if ( mouseDown ) {
      rect.x = event.pageX - 0.5 * rect.width;
      rect.y = event.pageY - 0.5 * rect.height;
    }
  }

  function onMouseUp( event ) {
    mouseDown = false;
  }

  canvas.addEventListener( 'mousedown', onMouseDown );
  canvas.addEventListener( 'mousemove', onMouseMove );
  canvas.addEventListener( 'mouseup', onMouseUp );

  document.getElementById( 'toggleQuadtreeVisibility' )
    .addEventListener( 'click', function() {
      drawing.quadtree = !drawing.quadtree;
    });

  init();
}) ( window, document );
