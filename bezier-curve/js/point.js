/*exported Point, BezierPoint, Endpoint, ControlPoint*/
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

  Point.prototype.dot = function( v ) {
    return this.x * v.x + this.y * v.y;
  };

  Point.prototype.clone = function() {
    return new this.constructor().copy( this );
  };

  Point.prototype.length = function() {
    return Math.sqrt( this.x * this.x + this.y * this.y );
  };

  Point.prototype.distanceToSquared = function( v ) {
    var dx = this.x - v.x,
        dy = this.y - v.y;

    return dx * dx + dy * dy;
  };

  Point.prototype.distanceTo = function( v ) {
    return Math.sqrt( this.distanceTo( v ) );
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


var BezierPoint = (function() {
  'use strict';

  function BezierPoint( x, y ) {
    Point.call( this, x, y );

    this.observers = [];
  }

  BezierPoint.prototype = Object.create( Point.prototype );
  BezierPoint.prototype.constructor = BezierPoint;

  BezierPoint.prototype.observe = function( object, callback, accept ) {
    this.observers.push({
      object: object,
      callback: callback
    });

    Object.observe( object, callback, accept );
    return this;
  };

  BezierPoint.prototype.unobserve = function( object, callback ) {
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

  BezierPoint.prototype.asymmetric = function( origin, point ) {
    var angleFrom = Point.prototype.angleFrom.call( point, origin );
    return this.setAngleFrom( origin, angleFrom + Math.PI );
  };

  BezierPoint.prototype.mirror = function( origin, point ) {
    return this.subVectors( origin, point )
      .addVectors( this, origin );
  };

  BezierPoint.prototype.contains = function( x, y, radius ) {
    var dx = x - this.x,
        dy = y - this.y;

    return ( dx * dx + dy * dy ) <= ( radius * radius );
  };

  BezierPoint.prototype.orthogonalTo = function( point ) {
    var horz = new Point( this.x, point.y ),
        vert = new Point( point.x, this.y );

    if ( this.distanceToSquared( horz ) < this.distanceToSquared( vert ) ) {
      this.copy( horz );
    } else {
      this.copy( vert );
    }

    return this;
  };

  return BezierPoint;

}) ();


var ControlPoint = (function() {
  'use strict';

  function ControlPoint( x, y ) {
    BezierPoint.call( this, x, y );

    this.endpoint = null;
  }

  ControlPoint.prototype = Object.create( BezierPoint.prototype );
  ControlPoint.prototype.constructor = ControlPoint;

  ControlPoint.prototype.relativeTo = function( point ) {
    this.endpoint = point;

    var notifier = Object.getNotifier( this );
    this.observe( point, function( changes ) {
      // Get position changes.
      changes.forEach(function( change ) {
        notifier.performChange( 'relative', function() {
          this.x += change.object.x - change.oldValue.x;
          this.y += change.object.y - change.oldValue.y;
        }.bind( this ));
      }, this );
    }.bind( this ), [ 'input' ] );

    return this;
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
    }, [ 'input' ] );
  }

  function Endpoint( x, y ) {
    BezierPoint.call( this, x, y );
    this.type = Type.ASYMMETRIC;

    this.controls = {
      prev: null,
      next: null
    };
  }

  Endpoint.Type = Type;

  Endpoint.prototype = Object.create( BezierPoint.prototype );
  Endpoint.prototype.constructor = Endpoint;

  Endpoint.prototype.draw = function( ctx ) {
    ctx.arc( this.x, this.y, 8, 0, 2 * Math.PI );
  };

  /**
   * Clone an endpoint and its child control points.
   *
   * If a points object is provided, use its optional next.prev properties to
   * hook up existing control points.
   */
  Endpoint.prototype.clone = function( points ) {
    points = points || {};

    var point = BezierPoint.prototype.clone.call( this );

    if ( points.prev ) {
      point.prev = points.prev;
    } else if ( this.prev ) {
      point.prev = this.prev.clone();
    }

    if ( points.next ) {
      point.next = points.next;
    } else if ( this.next ) {
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

      this.controls.prev = prev.unobserve().relativeTo( this );

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

      this.controls.next = next.unobserve().relativeTo( this );

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
