/*exported Spring*/
/**
 * A slimmed down version of http://facebook.github.io/rebound/.
 */
var Spring = (function() {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function PhysicsState() {
    this.position = 0;
    this.velocity = 0;
  }

  // Quartz Composer conversion.
  var convert = {
    tension: {
      fromQuartz: function( qcTension ) {
        return ( qcTension - 30 ) * 3.62 + 194;
      },

      toQuartz: function( tension ) {
        return ( tension - 194 ) / 3.62 + 30;
      }
    },

    friction: {
      fromQuartz: function( qcFriction ) {
        return ( qcFriction - 8 ) * 3 + 25;
      },

      toQuartz: function( friction ) {
        return ( friction - 25 ) / 3 + 8;
      }
    }
  };

  function Spring( tension, friction ) {
    this.state = new PhysicsState();
    this.previousState = new PhysicsState();
    this.tempState = new PhysicsState();

    this.start = 0;
    this.end = 0;

    this.tension = convert.tension.fromQuartz( tension || 0 );
    this.friction = convert.friction.fromQuartz( friction || 0 );

    // One milisecond timestep.
    this.timeStep = 1e-3;
    this.accumulator = 0;

    // High epsilon to avoid unnecessary renders.
    this.epsilon = 0.1;

    this.wasAtRest = true;
  }

  Spring.prototype.lerp = function( alpha ) {
    this.state.position = lerp( this.state.position, this.previousState.position, alpha );
    this.state.velocity = lerp( this.state.velocity, this.previousState.velocity, alpha );
  };

  Spring.prototype.setEnd = function( end ) {
    if ( this.end === end && this.isAtRest() ) {
      return;
    }

    this.start = this.state.position;
    this.end = end;
  };

  Spring.prototype.isAtRest = function() {
    // Absolute value of dx and dv < epsilon.
    return Math.abs( this.state.velocity ) < this.epsilon &&
      Math.abs( this.end - this.state.position ) <= this.epsilon;
  };

  Spring.prototype.setAtRest = function() {
    this.end = this.state.position;
    this.tempState.position = this.state.position;
    this.state.velocity = 0;
  };

  Spring.prototype.update = function( dt ) {
    var isAtRest = this.isAtRest();

    if ( isAtRest && this.wasAtRest ) {
      return;
    }

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Convert to seconds.
    dt *= 1e-3;

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
      aa = tension * ( this.end - tempPosition ) - friction * va;

      tempPosition = position + va * dt * 0.5;
      tempVelocity = velocity + aa * dt * 0.5;
      vb = tempVelocity;
      ab = tension * ( this.end - tempPosition ) - friction * vb;

      tempPosition = position + vb * dt * 0.5;
      tempVelocity = velocity + ab * dt * 0.5;
      vc = tempVelocity;
      ac = tension * ( this.end - tempPosition ) - friction * vc;

      tempPosition = position + vc * dt * 0.5;
      tempVelocity = velocity + ac * dt * 0.5;
      vd = tempVelocity;
      ad = tension * ( this.end - tempPosition ) - friction * vd;

      dxdt = ( va + 2 * ( vb + vc ) + vd ) / 6;
      dvdt = ( aa + 2 * ( ab + ac ) + ad ) / 6;

      position += dxdt * dt;
      velocity += dvdt * dt;
    }

    this.tempState.position = tempPosition;
    this.tempState.velocity = tempVelocity;

    this.state.position = position;
    this.state.velocity = velocity;

    if ( this.accumulator > 0 ) {
      this.lerp( this.accumulator / this.timeStep );
    }

    // Are we at rest now?
    if ( this.isAtRest() ) {
      this.start = this.end;
      this.state.positon = this.end;
      this.state.velocity = 0;
      isAtRest = true;
    }

    // Here we would notify activate and at-rest listeners.
    if ( this.wasAtRest ) {
      this.wasAtRest = false;
    }

    if ( isAtRest ) {
      this.wasAtRest = true;
    }
  };

  Spring.prototype.quartzTension = function() {
    if ( arguments.length ) {
      this.tension = convert.tension.fromQuartz( arguments[0] );
    }

    return convert.tension.toQuartz( this.tension );
  };

  Spring.prototype.quartzFriction = function() {
    if ( arguments.length ) {
      this.friction = convert.friction.fromQuartz( arguments[0] );
    }

    return convert.friction.toQuartz( this.friction );
  };

  return Spring;

}) ();
