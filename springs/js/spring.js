/*exported Spring*/
/**
 * A slimmed down version of http://facebook.github.io/rebound/.
 */
var Spring = (function() {
  'use strict';

  function PhysicsState() {
    this.position = 0;
    this.velocity = 0;
  }

  function Spring( tension, friction ) {
    this.state = new PhysicsState();
    this.previousState = new PhysicsState();
    this.tempState = new PhysicsState();

    this.start = 0;
    this.end = 1;

    this.tension = tension || 0;
    this.friction = friction || 0;

    this.time = 0;
    this.timeStep = 16;

    this.accumulator = 0;

    this.allowOvershoot = false;
  }

  Spring.prototype.tick = function( dt ) {
    if ( dt > 1e3 ) {
      dt = 1e3;
    }

    this.accumulator += dt;

    dt = this.timeStep;

    var tension = this.tension;
    var friction = this.friction;

    var position = this.state.position;
    var velocity = this.state.velocity;

    var tempPosition = this.tempState.position;
    var tempVelocity = this.tempState.velocity;

    // Velocities.
    var va, vb, vc, vd;
    // Accelerations.
    var aa, ab, ac, ad;

    // Derivatives.
    var dxdt, dvdt;

    while ( this.accumulator >= dt ) {
      this.accumulator -= dt;

      if ( this.accumulator < dt ) {
        this.previousState.position = position;
        this.previousState.velocity = velocity;
      }

      va = velocity;
      aa = (tension * (this.end - tempPosition)) - friction * va;

      tempPosition = position + va * 0.5 * dt;
      tempVelocity = velocity + aa * 0.5 * dt;
      vb = tempVelocity;
      ab = (tension * (this.end - tempPosition)) - friction * vb;

      tempPosition = position + vb * 0.5 * dt;
      tempVelocity = position + vb * 0.5 * dt;
      vc = tempVelocity;
      ac = (tension * (this.end - tempPosition)) - friction * vc;

      tempPosition = position + vc * 0.5 * dt;
      tempVelocity = position + vc * 0.5 * dt;
      vd = tempVelocity;
      ad = (tension * (this.end - tempPosition)) - friction * vd;

      dxdt = ( va + 2 * ( vb + vc ) + vd ) / 6;
      dvdt = ( aa + 2 * ( ab + ac ) + ad ) / 6;

      position += dxdt * dt;
      velocity += dvdt * dt;
    }

    this.tempState.position = tempPosition;
    this.tempState.velocity = tempVelocity;

    this.state.position = position;
    this.state.velocity = velocity;

    if ( this.accumulator ) {
      this.lerp( this.accumulator / this.timeStep );
    }
  };

  return Spring;

}) ();
