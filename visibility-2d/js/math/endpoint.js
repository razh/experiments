/*global Point*/
/*exported Endpoint*/
var Endpoint = (function() {
  'use strict';

  function Endpoint( x, y, begin, segment, angle, visualize ) {
    Point.call( this, x, y );
    this.begin = begin || false;
    this.segment = segment || null;
    this.angle = angle || 0.0;
    this.visualize = visualize || false;
  }

  Endpoint.prototype = new Point();
  Endpoint.prototype.constructor = Endpoint;

  Endpoint.prototype.compare = function( endpoint ) {
    if ( this.angle > endpoint.angle ) { return 1; }
    if ( this.angle < endpoint.angle ) { return -1; }
    // If same angle.
    if ( !this.begin && endpoint.begin ) { return 1; }
    if ( this.begin && !endpoint.begin ) { return -1; }
    return 0;
  };

  return Endpoint;
}) ();
