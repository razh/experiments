(function( window, document, undefined ) {
  'use strict';

  var EPSILON = 1e-3;

  var DEG_TO_RAD = Math.PI / 180,
      RAD_TO_DEG = 180 / Math.PI;

  var canvas = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var prevTime = Date.now(),
      currTime,
      running = true;

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function distance( x0, y0, x1, y1 ) {
    return Math.sqrt( distanceSquared( x0, y0, x1, y1 ) );
  }

  function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
  }

  function Bone( src, dst ) {
    this.src = src || new Point();
    this.dst = dst || new Point();

    this.parent = null;
    this.children = [];

    this.angle = 0;

    this.length = distance( this.src.x, this.src.y, this.dst.x, this.dst.y );
  }

  Bone.prototype.update = function( dt ) {
    if ( !this.src || !this.dst ) {
      return;
    }

    if ( this.parent ) {
      var parent = this.parent,
          parentAngle = Math.atan2( parent.dst.y - parent.src.y, parent.dst.x - parent.src.x );

      this.dst.x = this.src.x + Math.cos( this.angle + parentAngle ) * this.length;
      this.dst.y = this.src.y + Math.sin( this.angle + parentAngle ) * this.length;
    } else {
      var length = distance( this.src.x, this.src.y, this.dst.x, this.dst.y );

      if ( Math.abs( length - this.length ) > EPSILON ) {
        var ratio = this.length / length;
        this.dst.x = this.src.x + ( this.dst.x - this.src.x ) * ratio;
        this.dst.y = this.src.y + ( this.dst.y - this.src.y ) * ratio;
      }
    }

    this.children.forEach(function( child ) {
      child.src.x = this.dst.x;
      child.src.y = this.dst.y;

      child.update( dt );
    }, this );
  };

  Bone.prototype.draw = function( ctx ) {
    ctx.beginPath();

    ctx.moveTo( this.src.x, this.src.y );
    ctx.lineTo( this.dst.x, this.dst.y );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.font = '12px Helvetica';
    ctx.fillStyle = 'black';
    ctx.fillText( ( this.angle * RAD_TO_DEG ).toFixed(0), this.dst.x, this.dst.y );

    this.children.forEach(function( child ) {
      child.draw( ctx );
    });
  };

  Bone.prototype.attach = function( bone ) {
    this.children.push( bone );
    bone.parent = this;
    bone.angle = Math.atan2( this.dst.y - this.src.y, this.dst.x - this.src.x ) -
      Math.atan2( bone.dst.y - bone.src.y, bone.dst.x - bone.src.x );

    return this;
  };

  function Skeleton( x, y ) {
    Point.call( this, x, y );
    this.root = null;
  }

  Skeleton.prototype = new Point();
  Skeleton.prototype.constructor = Skeleton;

  Skeleton.prototype.draw = function( ctx ) {
    if ( !this.root ) {
      return;
    }

    this.root.draw( ctx );
  };

  Skeleton.prototype.update = function() {
    if ( !this.root ) {
      return;
    }

    this.root.src.x = this.x;
    this.root.src.y = this.y;

    this.root.update();
  };

  Skeleton.prototype.attach = function( bone ) {
    this.root = bone;
    return this;
  };

  var skeleton = new Skeleton( 100, 100 );
  skeleton.attach(
    new Bone(
      new Point( 100, 100 ),
      new Point( 100, 120 )
    ).attach(
      new Bone(
        new Point( 100, 120 ),
        new Point( 120, 170 )
      ).attach(
        new Bone(
          new Point( 120, 170 ),
          new Point( 100, 200 )
        )
      ).attach(
        new Bone(
          new Point( 120, 170 ),
          new Point( 140, 200 )
        )
      )
    )
    .attach(
      new Bone(
        new Point( 100, 120 ),
        new Point( 70, 170 )
      )
    )
  );

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
    // window.requestAnimationFrame( tick );
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    skeleton.update( dt );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    skeleton.draw( ctx );
  }

  tick();

  function onMouseMove( evemt ) {
    var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;

    skeleton.x = x;
    skeleton.y = y;

    tick();
  }

  canvas.addEventListener( 'mousemove', onMouseMove );
}) ( window, document );
