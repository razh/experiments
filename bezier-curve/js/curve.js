/*globals Endpoint, ControlPoint*/
/*exported BezierCurve*/
var BezierCurve = (function() {
  'use strict';

  function BezierCurve() {
    this.p0 = new Endpoint();
    this.p1 = new ControlPoint();
    this.p2 = new ControlPoint();
    this.p3 = new Endpoint();

    // Set endpoints.
    if ( arguments.length === 4 ) {
      this.p0.set( arguments[0], arguments[1] );
      this.p3.set( arguments[2], arguments[3] );
    }

    // Set endpoint and control points.
    // For path continuation.
    if ( arguments.length === 6 ) {
      this.p1.set( arguments[0], arguments[1] );
      this.p2.set( arguments[2], arguments[3] );
      this.p3.set( arguments[4], arguments[5] );
    }

    // Set endpoints and control points.
    if ( arguments.length === 8 ) {
      this.p0.set( arguments[0], arguments[1] );
      this.p1.set( arguments[2], arguments[3] );
      this.p2.set( arguments[4], arguments[5] );
      this.p3.set( arguments[6], arguments[7] );
    }

    this.p0.name = 'p0';
    this.p1.name = 'p1';
    this.p2.name = 'p2';
    this.p3.name = 'p3';

    this.p1.relativeTo( this.p0 );
    this.p2.relativeTo( this.p3 );

    this.p0.observeControlPoint( this.p1 );
    this.p3.observeControlPoint( this.p2 );

    // Object.observe() state.
    this.prev = null;
    this.next = null;
    this.link = null;
    this.prevCurve = null;
  }

  BezierCurve.prototype.draw = function( ctx ) {
    ctx.moveTo( this.p0.x, this.p0.y );
    ctx.bezierCurveTo(
      this.p1.x, this.p1.y,
      this.p2.x, this.p2.y,
      this.p3.x, this.p3.y
    );
  };

  BezierCurve.prototype.controlPoints = function() {
    return [ this.p0, this.p1, this.p2, this.p3 ];
  };

  /**
   * Observervation functions.
   */
  BezierCurve.prototype.observePrev = function( curve ) {
    if ( this.prev ) {
      this.unobservePrev();
    }

    this.prev = {
      object: curve.p3,
      callback: function callbacl( changes ) {
        changes.forEach(function( change ) {
          console.log( 'prev' );
          Object.getNotifier( this.p0 ).notify( change );
        }, this );
      }.bind( this )
    };

    Object.observe( this.prev.object, this.prev.callback, [ 'control' ] );
    return this;
  };

  BezierCurve.prototype.unobservePrev = function() {
    if ( this.prev ) {
      Object.unobserve( this.prev.object, this.prev.callback );
      this.prev = null;
    }

    return this;
  };

  BezierCurve.prototype.observeNext = function( curve ) {
    this.next = {
      object: curve.p0,
      callback: function( changes ) {
        changes.forEach(function( change ) {
          console.log( 'next' );
          Object.getNotifier( this.p3 ).notify( change );
        }, this );
      }.bind( this )
    };

    Object.observe( this.next.object, this.next.callback, [ 'control' ] );
    return this;
  };

  BezierCurve.prototype.unobserveNext = function() {
    if ( this.next ) {
      Object.unobserve( this.next.object, this.next.callback );
      this.next = null;
    }

    return this;
  };


  BezierCurve.prototype.linkTo = function( curve ) {
    if ( this.link ) {
      this.unlink();
    }

    this.observePrev( curve );
    curve.observeNext( this );

    this.link = {
      object: curve.p3,
      callback: function( changes ) {
        changes.forEach(function( change ) {
          var name = change.name;
          if ( name !== 'x' && name !== 'y' ) {
            return;
          }

          this.p0[ name ] += change.object[ name ] - change.oldValue;
        }, this );
      }.bind( this )
    };

    Object.observe( this.link.object, this.link.callback );
    return this;
  };

  BezierCurve.prototype.unlink = function() {
    this.unobservePrev();
    this.unobserveNext();

    if ( this.link ) {
      Object.unobserve( this.link.object, this.link.callback );
      this.link = null;
    }

    return this;
  };

  return BezierCurve;

}) ();
