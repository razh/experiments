/*global Camera, requestAnimationFrame*/
(function( window, document, undefined ) {
  'use strict';

  function Quad(
    x0, y0, z0,
    x1, y1, z1,
    x2, y2, z2,
    x3, y3, z3
  ) {
    this.x0 = x0 || 0;
    this.y0 = y0 || 0;
    this.z0 = z0 || 0;

    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
    this.z1 = z1 || 0;

    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
    this.z2 = z2 || 0;

    this.x3 = x3 || 0;
    this.y3 = y3 || 0;
    this.z3 = z3 || 0;
  }

  Quad.prototype.draw = function( ctx, camera ) {
    var p0 = camera.project( this.x0, this.y0, Math.max( this.z0, camera.near ) ),
        p1 = camera.project( this.x1, this.y1, Math.max( this.z1, camera.near ) ),
        p2 = camera.project( this.x2, this.y2, Math.max( this.z2, camera.near ) ),
        p3 = camera.project( this.x3, this.y3, Math.max( this.z3, camera.near ) );

    ctx.moveTo( p0[0], p0[1] );
    ctx.lineTo( p1[0], p1[1] );
    ctx.lineTo( p2[0], p2[1] );
    ctx.lineTo( p3[0], p3[1] );
    ctx.lineTo( p0[0], p0[1] );
  };

  var canvas  = document.createElement( 'canvas' ),
      context = canvas.getContext( '2d' );

  var camera;
  var quads = [];

  function init() {
    canvas.width  = 568;
    canvas.height = 320;
    document.body.appendChild( canvas );

    camera = new Camera( 90, canvas.width / canvas.height );
    camera.updateProjectionMatrix();

    var x = -60,
        y = -100,
        z = 0,
        width = 240,
        depth = 500;

    var delta = 1000;
    var quadCount = 8;

    var i;
    for ( i = 0; i < quadCount; i++ ) {
      quads.push(
        new Quad(
          -x - width, y, z + i * delta,
          -x - width, y, z + depth + i * delta,
          x + width, y, z + depth + i * delta,
          x + width, y, z + i * delta
        )
      );
    }

    for ( i = 0; i < quadCount; i++ ) {
      quads.push(
        new Quad(
          y - 0.5 * width, x, z + i * delta,
          y - 0.5 * width, x, z + depth + i * delta,
          y - width, x + width, z + depth + i * delta,
          y - width, x + width, z + i * delta
        )
      );
    }

    for ( i = 0; i < quadCount; i++ ) {
      quads.push(
        new Quad(
          -y + 0.5 * width, x, z + i * delta,
          -y + 0.5 * width, x, z + depth + i * delta,
          -y + width, x + width, z + depth + i * delta,
          -y + width, x + width, z + i * delta
        )
      );
    }
  }

  var count = 0;
  var cropped = false;

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    ctx.fillStyle = '#fdc';
    ctx.strokeStyle = '#fa5';
    ctx.lineWidth = 2 / ctx.canvas.height;
    ctx.shadowColor = '#fa5';
    ctx.shadowBlur = 32;

    ctx.save();
    ctx.translate( ctx.canvas.width / 2, ctx.canvas.height / 2 );
    ctx.scale( ctx.canvas.width, ctx.canvas.height );

    count = 0;
    ctx.beginPath();
    quads.forEach(function( quad ) {
      if ( quad.z0 < 0 && quad.z1 < 0 && quad.z2 < 0 && quad.z3 < 0 ) {
        quad.z0 += 8000;
        quad.z1 += 8000;
        quad.z2 += 8000;
        quad.z3 += 8000;
        return;
      }

      count++;
      quad.draw( ctx, camera );
    });

    ctx.stroke();
    ctx.fill();

    ctx.restore();

    ctx.textAlign = 'left';
    ctx.font = '1em monospace';
    ctx.fillText( count + ' quads', 16, 16 );

    ctx.textAlign = 'center';
    if ( cropped ) {
      ctx.fillText( 'cropped', 0.5 * canvas.width, 0.25 * canvas.height );
    }

    ctx.font = '0.8em monospace';
    ctx.fillText(
      JSON.stringify( canvas.getBoundingClientRect() ),
      0.5 * canvas.width,
      0.2 * canvas.height
    );
  }


  function update() {
    var dz = 70;
    quads.forEach(function( quad ) {
      quad.z0 -= dz;
      quad.z1 -= dz;
      quad.z2 -= dz;
      quad.z3 -= dz;
    });
  }

  function tick() {
    update();
    draw( context );
    requestAnimationFrame( tick );
  }


  init();
  console.time('test');
  tick();
  console.timeEnd('test');

  canvas.addEventListener( 'touchstart', function( event ) {
    event.preventDefault();
  });

  canvas.addEventListener( 'touchmove', function( event ) {
    event.preventDefault();
  });

  function onResize() {
    cropped = canvas.width > window.innerWidth ||
      canvas.height > window.innerHeight;
  }

  window.addEventListener( 'resize',  onResize );
  window.addEventListener( 'orientationchange',  onResize );

  window.addEventListener( 'blur', function() {
    cropped = true;
  });

  window.addEventListener( 'focus', function() {
    cropped = false;
  });

  onResize();

}) ( window, document );
