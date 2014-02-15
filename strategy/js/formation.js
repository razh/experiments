'use strict';

/**
 * An oriented bounding box calculated from three points.
 */
function Formation( x0, y0, x1, y1, x2, y2 ) {
  this.x = x0;
  this.y = y0;

  // First edge (width).
  var dx = x1 - x0,
      dy = y1 - y0;

  this.angle = Math.atan2( -dy, dx );
  this.width = Math.sqrt( dx * dx + dy * dy );

  // Second edge (height).
  var point = this.toLocal( x2, y2 );
  this.height = point.y;

  Object.freeze( this );
}

Formation.prototype.applyTransform = function( ctx ) {
  ctx.translate( this.x, this.y );
  ctx.rotate( -this.angle );
};

Formation.prototype.draw = function( ctx ) {
  ctx.save();

  this.applyTransform( ctx );
  ctx.rect( 0, 0, this.width, this.height );

  ctx.restore();
};

Formation.prototype.toWorld = function( x, y ) {
  var cos, sin;
  var rx, ry;

  if ( this.angle ) {
    cos = Math.cos( -this.angle );
    sin = Math.sin( -this.angle );

    rx = cos * x - sin * y;
    ry = sin * x + cos * y;

    x = rx;
    y = ry;
  }

  return {
    x: x + this.x,
    y: y + this.y
  };
};

Formation.prototype.toLocal = function( x, y ) {
  x -= this.x;
  y -= this.y;

  var cos, sin;
  var rx, ry;

  if ( this.angle ) {
    cos = Math.cos( this.angle );
    sin = Math.sin( this.angle );

    rx = cos * x - sin * y;
    ry = sin * x + cos * y;

    x = rx;
    y = ry;
  }

  return {
    x: x,
    y: y
  };
};

Formation.prototype.getPositions = function( count, rankSpacing, fileSpacing ) {
  var xCount = Math.ceil( this.width / rankSpacing );

  // Flip fileSpacing if height is negative.
  fileSpacing *= this.height < 0 ? -1 : 1;

  var positions = [];
  var i = 0;
  while ( i < count ) {
    positions.push({
      x: ( i % xCount ) * rankSpacing,
      y: Math.floor( i / xCount ) * fileSpacing
    });

    i++;
  }

  return positions;
};

/**
 * Unlike getPositions() which takes a predetermined unit count,
 * getPositionsFilled() fills the entire formation box with units
 * separated by the given spacing parameters.
 */
Formation.prototype.getPositionsFilled = function( rankSpacing, fileSpacing ) {
  // Return empty array if zero-spacing (results in infinite unit count).
  if ( !rankSpacing || !fileSpacing ) {
    return [];
  }

  // Absolute value allow for positive yCounts if height is negative.
  var xCount = Math.ceil( this.width / rankSpacing ),
      yCount = Math.ceil( Math.abs( this.height ) / fileSpacing );

  return this.getPositions( xCount * yCount, rankSpacing, fileSpacing );
};

// World space coordinate getters.
Object.defineProperty( Formation.prototype, 'x1', {
  get: function() {
    return this.toWorld( this.width, 0 ).x;
  }
});

Object.defineProperty( Formation.prototype, 'y1', {
  get: function() {
    return this.toWorld( this.width, 0 ).y;
  }
});

Object.defineProperty( Formation.prototype, 'x2', {
  get: function() {
    return this.toWorld( this.width, this.height ).x;
  }
});

Object.defineProperty( Formation.prototype, 'y2', {
  get: function() {
    return this.toWorld( this.width, this.height ).y;
  }
});
