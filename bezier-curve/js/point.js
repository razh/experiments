/*exported Point, Endpoint, ControlPoint*/
var Point = (function() {
  'use strict';

  /**
   * This Point class attempts to emulate three.js's Vector2 methods on an
   * as-needed basis.
   */
  function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Point.prototype.add = function( x, y ) {
    this.x += x;
    this.y += y;
    return this;
  };

  Point.prototype.addVectors = function( a, b ) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  };

  Point.prototype.sub = function( x, y ) {
    this.x -= x;
    this.y -= y;
    return this;
  };

  Point.prototype.subVectors = function( a, b ) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  };

  Point.prototype.multiplyScalar = function( s ) {
    this.x *= s;
    this.y *= s;
    return this;
  };

  Point.prototype.set = function( x, y ) {
    this.x = x;
    this.y = y;
    return this;
  };

  Point.prototype.copy = function( v ) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  Point.prototype.clone = function() {
    return new this.constructor().copy( this );
  };

  Point.prototype.length = function() {
    return Math.sqrt( this.x * this.x + this.y * this.y );
  };

  Point.prototype.angleFrom = function( point ) {
    var temp = new Point().subVectors( this, point );
    return Math.atan2( temp.y, temp.x );
  };

  Point.prototype.setAngleFrom = function( origin, angle ) {
    // Relative distance from origin.
    var length = this.subVectors( this, origin ).length();

    return this.set(
        Math.cos( angle ),
        Math.sin( angle )
      )
      .multiplyScalar( length )
      .addVectors( this, origin );
  };

  return Point;

}) ();


var ControlPoint = (function() {
  'use strict';

  function ControlPoint( x, y ) {
    Point.call( this, x, y );

    this.observers = [];
  }

  ControlPoint.prototype = Object.create( Point.prototype );
  ControlPoint.prototype.constructor = ControlPoint;

  ControlPoint.prototype.observe = function( object, callback, accept ) {
    this.observers.push({
      object: object,
      callback: callback
    });

    Object.observe( object, callback, accept );
    return this;
  };

  ControlPoint.prototype.unobserve = function( object, callback ) {
    // Remove all observers.
    var observer;
    var i, il;
    if ( !arguments.length ) {
      for ( i = 0, il = this.observers.length; i < il; i++ ) {
        observer = this.observers[i];
        Object.unobserve( observer.object, observer.callback );
      }

      this.observers = [];
      return this;
    }

    for ( i = 0, il = this.observers.length; i < il; i++ ) {
      observer = this.observers[i];
      if ( object === observer.object && callback === observer.callback ) {
        Object.unobserve( object, callback );
        this.observers.splice( i, 1 );
        return this;
      }
    }
  };

  ControlPoint.prototype.relativeTo = function( point ) {
    this.observe( point, function( changes ) {
      // Get position changes.
      changes.forEach(function( change ) {
        var name = change.name;
        if ( name !== 'x' && name !== 'y' ) {
          return;
        }

        this[ name ] += change.object[ name ] - change.oldValue;
      }, this );
    }.bind( this ));
    return this;
  };

  ControlPoint.prototype.asymmetric = function( origin, point ) {
    var angleFrom = Point.prototype.angleFrom.call( point, origin );
    return this.setAngleFrom( origin, angleFrom + Math.PI );
  };

  ControlPoint.prototype.mirror = function( origin, point ) {
    return this.subVectors( origin, point )
      .addVectors( this, origin );
  };

  ControlPoint.prototype.contains = function( x, y, radius ) {
    var dx = x - this.x,
        dy = y - this.y;

    return ( dx * dx + dy * dy ) <= ( radius * radius );
  };

  ControlPoint.prototype.draw = function( ctx ) {
    ctx.rect( this.x - 4, this.y - 4, 8, 8 );
  };

  return ControlPoint;

}) ();


var Endpoint = (function() {
  'use strict';

  var Type = {
    DISCONNECTED: 0,
    MIRROR:       1,
    ASYMMETRIC:   2
  };

  /**
   * Update self based on observed changes to other.
   * Changes are performed under the 'translate' namespace.
   *
   * @param  {Endpoint} endpoint.
   * @param  {ControlPoint} self
   * @param  {ControlPoint} other
   */
  function observeControlFn( endpoint, self, other ) {
    var notifier = Object.getNotifier( self );
    self.observe( other, function() {
      if ( !endpoint.type ) {
        return;
      }

      notifier.performChange( 'translate', function() {
        if ( endpoint.type === Type.MIRROR ) {
          self.mirror( endpoint, other );
        } else if ( endpoint.type === Type.ASYMMETRIC ) {
          self.asymmetric( endpoint, other );
        }
      });
    }
  }

  function Endpoint( x, y ) {
    ControlPoint.call( this, x, y );
    this.type = Type.ASYMMETRIC;

    this.controls = {
      prev: null,
      next: null
    };
  }

  Endpoint.Type = Type;

  Endpoint.prototype = Object.create( ControlPoint.prototype );
  Endpoint.prototype.constructor = Endpoint;

  Endpoint.prototype.draw = function( ctx ) {
    ctx.arc( this.x, this.y, 8, 0, 2 * Math.PI );
  };

  Endpoint.prototype.clone = function() {
    var point = ControlPoint.prototype.clone.call( this );

    if ( this.prev ) {
      point.prev = this.prev.clone();
    }

    if ( this.next ) {
      point.next = this.next.clone();
    }

    return point;
  };

  Object.defineProperty( Endpoint.prototype, 'prev', {
    get: function() {
      return this.controls.prev;
    },

    set: function( prev ) {
      if ( this.controls.prev ) {
        this.controls.prev.unobserve();
      }

      this.controls.prev = prev.relativeTo( this );

      var next = this.next;
      if ( next ) {
        // Reattach observers.
        next.unobserve().relativeTo( this );

        observeControlFn( this, prev, next );
        observeControlFn( this, next, prev );
      }
    }
  });

  Object.defineProperty( Endpoint.prototype, 'next', {
    get: function() {
      return this.controls.next;
    },

    set: function( next ) {
      if ( this.controls.next ) {
        this.controls.next.unobserve();
      }

      this.controls.next = next.relativeTo( this );

      var prev = this.prev;
      if ( prev ) {
        // Reattach observers.
        prev.unobserve().relativeTo( this );

        observeControlFn( this, prev, next );
        observeControlFn( this, next, prev );
      }
    }
  });

  return Endpoint;

}) ();
