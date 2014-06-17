/*exported Point, Endpoint, ControlPoint*/
var Point = (function() {
  'use strict';

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

  return Point;

}) ();


var ControlPoint = (function() {
  'use strict';

  function ControlPoint( x, y ) {
    Point.call( this, x, y );
  }

  ControlPoint.prototype = Object.create( Point.prototype );
  ControlPoint.prototype.constructor = ControlPoint;

  ControlPoint.prototype.relativeTo = function( point ) {
    Object.observe( point, function( changes ) {
      changes.forEach(function( change ) {
        var name = change.name;
        if ( name !== 'x' && name !== 'y' ) {
          return;
        }

        this[ name ] += change.object[ name ] - change.oldValue;
      }, this );
    }.bind( this ));
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

  function Endpoint( x, y ) {
    ControlPoint.call( this, x, y );
  }

  Endpoint.prototype = Object.create( ControlPoint.prototype );
  Endpoint.prototype.constructor = Endpoint;

  Endpoint.prototype.draw = function( ctx ) {
    ctx.arc( this.x, this.y, 8, 0, 2 * Math.PI );
  };

  return Endpoint;

}) ();
