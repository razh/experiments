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

  Point.prototype.sub = function( x, y ) {
    this.x -= x;
    this.y -= y;
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

  return ControlPoint;

}) ();


var Endpoint = (function() {
  'use strict';

  function Endpoint( x, y ) {
    ControlPoint.call( this, x, y );
  }

  Endpoint.prototype = Object.create( ControlPoint.prototype );
  Endpoint.prototype.constructor = Endpoint;

  return Endpoint;

}) ();
