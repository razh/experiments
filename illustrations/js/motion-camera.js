(function( window, document, undefined ) {
  'use strict';

  var width,
      height;

  var portrait;

  function Box( el ) {
    if ( typeof el === 'string' ) {
      el = document.querySelector( el );
    }

    // Get the initial position.
    var computedStyle = window.getComputedStyle( el );
    if ( !computedStyle ) {
      throw new TypeError( 'Not a valid Element.' );
    }

    var transform = computedStyle.webkitTransform || computedStyle.transform;

    var translate3d;
    if ( transform.match( /^matrix3d\(.*/ ) ) {
      // Assume it's a matrix3d() transform, we only want the three translation values.
      translate3d = transform.split( ',' ).slice( 12, 15 );
    } else if ( transform.match( /^matrix\(.*/ ) ) {
      translate3d = transform.split( ',' ).slice( 4, 6 );
    } else {
      translate3d = [];
    }

    this.el = el;

    this.x = parseFloat( translate3d[0] ) || 0;
    this.y = parseFloat( translate3d[1] ) || 0;
    this.z = parseFloat( translate3d[2] ) || 0;
  }

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
    this.speed = 1000;
  }

  Camera.prototype.applyTransformToObject = function( object ) {
    var x = object.x,
        y = object.y,
        z = object.z;

    var transform = 'translate3d(' +
      ( x - this.x ) + 'px, ' +
      ( y + this.y ) + 'px, ' +
      ( z - this.z ) + 'px)';

    object.el.style.webkitTransform = transform;
    object.el.style.transform = transform;
  };

  Camera.prototype.update = function( dt ) {
    var speed = this.speed * dt;

    // Up arrow.
    if ( keys[ 38 ] ) { this.y += speed; }
    // Down arrow.
    if ( keys[ 40 ] ) { this.y -= speed; }
    // A.
    if ( keys[ 65 ] ) { this.x -= speed; }
    // D.
    if ( keys[ 68 ] ) { this.x += speed; }
    // W.
    if ( keys[ 87 ] ) { this.z -= speed; }
    // S.
    if ( keys[ 83 ] ) { this.z += speed; }

    // Update debug elements.
    cameraXEl.innerHTML = 'camera-x: ' + this.x.toFixed(2);
    cameraYEl.innerHTML = 'camera-y: ' + this.y.toFixed(2);
    cameraZEl.innerHTML = 'camera-z: ' + this.z.toFixed(2);
  };

  var scene = [
    new Box( '.center' ),
    new Box( '.back-top-left' ),
    new Box( '.back-top-right' ),
    new Box( '.back-bottom-left' ),
    new Box( '.back-bottom-right' ),
    new Box( '.front-top-left' ),
    new Box( '.front-top-right' ),
    new Box( '.front-bottom-left' ),
    new Box( '.front-bottom-right' )
  ];

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
    scene.forEach(function( box ) {
      camera.applyTransformToObject( box );
    });
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

  // Device orientation.
  var rotationEl = debugEl.querySelector( '.rotation' );

  var alphaEl = rotationEl.querySelector( '.alpha' ),
      betaEl  = rotationEl.querySelector( '.beta' ),
      gammaEl = rotationEl.querySelector( '.gamma' );

  alphaEl.innerHTML = 'alpha';
  betaEl.innerHTML  = 'beta';
  gammaEl.innerHTML = 'gamma';

  // Device motion.
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
  intervalEl.innerHTML = 'interval';

  // Camera.
  var cameraEl = debugEl.querySelector( '.camera' );

  var cameraXEl = cameraEl.querySelector( '.camera-x' ),
      cameraYEl = cameraEl.querySelector( '.camera-y' ),
      cameraZEl = cameraEl.querySelector( '.camera-z' );

  // Scene element.
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
    alphaEl.innerHTML = 'alpha: ' + event.alpha.toFixed(2);
    betaEl.innerHTML  = 'beta:  ' + event.beta.toFixed(2);
    gammaEl.innerHTML = 'gamme: ' + event.gamma.toFixed(2);

    onResize();

    if ( portrait ) {
      rotate( event.beta, -event.gamma );
    } else {
      rotate( event.gamma, event.beta );
    }
  }

  function onDeviceMotion( event ) {
    var acceleration = event.acceleration;
    axEl.innerHTML = 'ax: ' + acceleration.x.toFixed(2);
    ayEl.innerHTML = 'ay: ' + acceleration.y.toFixed(2);
    azEl.innerHTML = 'az: ' + acceleration.z.toFixed(2);

    var rotationRate = event.rotationRate;
    rotationRateAlphaEl.innerHTML = 'rate-alpha: ' + rotationRate.alpha.toFixed(2);
    rotationRateBetaEl.innerHTML  = 'rate-beta:  ' + rotationRate.beta.toFixed(2);
    rotationRateGammaEl.innerHTML = 'rate-gamma: ' + rotationRate.gamma.toFixed(2);

    // Refresh interval (in milliseconds).
    var interval = event.interval;
    intervalEl.innerHTML = 'interval: ' + interval.toFixed(2);
  }

  onResize();
  document.addEventListener( 'mousemove', onMouseMove );
  window.addEventListener( 'resize', onResize );
  window.addEventListener( 'deviceorientation', onDeviceOrientation );
  window.addEventListener( 'devicemotion', onDeviceMotion );

  document.addEventListener( 'keydown', function( event ) {
    keys[ event.which ] = true;
    if ( event.shiftKey ) {
      running = true;
      tick();
    }

    // R. Reset.
    if ( event.which === 82 ) {
      camera.x = 0;
      camera.y = 0;
      camera.z = 0;
      draw();

      rotate( 0, 0 );
    }
  });

  document.addEventListener( 'keyup', function( event ) {
    keys[ event.which ] = false;
    if ( !event.shiftKey ) {
      running = false;
    }
  });

  tick();
}) ( window, document );
