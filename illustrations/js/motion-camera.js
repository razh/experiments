(function( window, document, undefined ) {
  'use strict';

  var width,
      height;

  var portrait;

  function Camera( x, y, z ) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

    // Yeah, we should probably use a quaternion, but we're too lazy to do a
    // full implementation here.
    this.rotateX = 0;
    this.rotateY = 0;
    this.rotateZ = 0;

    // Pixels per second.
    this.speed = 100;
  }

  Camera.prototype.applyTransform = function( el ) {
    var transform = 'translate3d(' +
      -this.x + 'px, ' +
       this.y + 'px, ' +
      -this.z + 'px) ' +
      'rotateX(' + this.rotateX + 'deg) ' +
      'rotateY(' + this.rotateY + 'deg) ' +
      'rotateZ(' + this.rotateZ + 'deg)';

    el.style.webkitTransform = transform;
    el.style.transform = transform;
  };

  Camera.prototype.update = function( dt ) {
    var speed = this.speed * dt;

    // Ctrl.
    if ( keys[ 17 ] ) { this.y -= speed; }
    // Space.
    if ( keys[ 32 ] ) { this.y += speed; }
    // A.
    if ( keys[ 65 ] ) { this.x -= speed; }
    // D.
    if ( keys[ 68 ] ) { this.x += speed; }
    // W.
    if ( keys[ 87 ] ) { this.z -= speed; }
    // S.
    if ( keys[ 83 ] ) { this.z += speed; }
  };

  var camera = new Camera();

  var prevTime = Date.now(),
      currTime;

  var running = true;

  var keys = [];

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    // Limit frame time to
    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Seconds to milliseconds.
    dt *= 1e-3;

    camera.update( dt );
  }

  function draw() {
    camera.applyTransform( el );
  }

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw();

    window.requestAnimationFrame( tick );
  }

  var debugEl = document.querySelector( '.debug' );

  var rotationEl = debugEl.querySelector( '.rotation' );

  var alphaEl = rotationEl.querySelector( '.alpha' ),
      betaEl  = rotationEl.querySelector( '.beta' ),
      gammaEl = rotationEl.querySelector( '.gamma' );

  alphaEl.innerHTML = 'alpha';
  betaEl.innerHTML  = 'beta';
  gammaEl.innerHTML = 'gamma';

  var accelerationEl = debugEl.querySelector( '.acceleration' );

  var axEl = accelerationEl.querySelector( '.ax' ),
      ayEl = accelerationEl.querySelector( '.ay' ),
      azEl = accelerationEl.querySelector( '.az' );

  axEl.innerHTML = 'ax';
  ayEl.innerHTML = 'ay';
  azEl.innerHTML = 'az';

  var rotationRateEl = debugEl.querySelector( '.rotation-rate' );

  var rotationRateAlphaEl = rotationRateEl.querySelector( '.rotation-rate-alpha' ),
      rotationRateBetaEl  = rotationRateEl.querySelector( '.rotation-rate-beta' ),
      rotationRateGammaEl = rotationRateEl.querySelector( '.rotation-rate-gamma' );

  rotationRateAlphaEl.innerHTML = 'rate-alpha';
  rotationRateBetaEl.innerHTML  = 'rate-beta';
  rotationRateGammaEl.innerHTML = 'rate-gamma';

  var intervalEl = debugEl.querySelector( '.interval' );

  intervalEl.innerHTML = '0';

  var el = document.querySelector( '.container' );

  function rotate( rx, ry ) {
    var transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    el.style.webkitTransform = transform;
    el.style.transform = transform;
  }

  function onMouseMove( event ) {
    var rx = -( event.clientY / window.innerHeight - 0.5 ) * 180,
        ry =  ( event.clientX / window.innerWidth  - 0.5 ) * 180;

    rotate( rx, ry );
  }

  function onResize() {
    width  = window.innerWidth;
    height = window.innerHeight;

    portrait = width < height;
  }

  function onDeviceOrientation( event ) {
    alphaEl.innerHTML = event.alpha.toFixed(2);
    betaEl.innerHTML  = event.beta.toFixed(2);
    gammaEl.innerHTML = event.gamma.toFixed(2);

    onResize();

    if ( portrait ) {
      rotate( event.beta, event.gamma );
    } else {
      rotate( event.gamma, event.beta );
    }
  }

  function onDeviceMotion( event ) {
    var acceleration = event.acceleration;
    axEl.innerHTML = acceleration.x.toFixed(2);
    ayEl.innerHTML = acceleration.y.toFixed(2);
    azEl.innerHTML = acceleration.z.toFixed(2);

    var rotationRate = event.rotationRate;
    rotationRateAlphaEl.innerHTML = rotationRate.alpha.toFixed(2);
    rotationRateBetaEl.innerHTML  = rotationRate.beta.toFixed(2);
    rotationRateGammaEl.innerHTML = rotationRate.gamma.toFixed(2);

    // Refresh interval (in milliseconds).
    var interval = event.interval;
    intervalEl.innerHTML = interval.toFixed(2);

    // This isn't right.
    camera.x += acceleration.x * interval;
    camera.y += acceleration.y * interval;
    camera.z += acceleration.z * interval;
  }

  onResize();
  document.addEventListener( 'mousemove', onMouseMove );
  window.addEventListener( 'resize', onResize );
  window.addEventListener( 'deviceorientation', onDeviceOrientation );
  window.addEventListener( 'devicemotion', onDeviceMotion );

  document.addEventListener( 'keydown', function( event ) {
    keys[ event.which ] = true;
  });

  document.addEventListener( 'keyup', function( event ) {
    keys[ event.which ] = false;
  });

  // tick();
}) ( window, document );
