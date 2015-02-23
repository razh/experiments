/*globals define*/
define([
  'math/geometry',
  'math/point',
  'math/endpoint',
  'math/segment'
], function( Geometry, Point, Endpoint, Segment ) {
  'use strict';

  // Array utility functions.
  function insertBefore( array, value, element ) {
    var index = array.indexOf( element );
    if ( index >= 0 ) {
      array.splice( index, 0, value );
    }
  }

  function remove( array, value ) {
    var index = array.indexOf( value );
    if ( index >= 0 ) {
      array.splice( index, 1 );
    }
  }

  function Level() {
    // Level geometry.
    this.segments = [];
    this.endpoints = [];

    // Light.
    this.light = new Point( 0, 0 );

    // Open line segments.
    this.open = [];

    this.output = [];
    this.intersections = [];
  }

  Level.prototype.draw = function( ctx ) {
    ctx.strokeStyle = 'white';

    // Draw walls.
    ctx.beginPath();

    this.segments.forEach(function( segment ) {
      segment.draw( ctx );
    });

    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw wall sections illuminated by light.
    ctx.beginPath();

    var i = 0;
    while ( i < this.output.length ) {
      var p0 = this.output[ i++ ],
          p1 = this.output[ i++ ];

      ctx.moveTo( p0.x, p0.y );
      ctx.lineTo( p1.x, p1.y );
    }

    ctx.lineWidth = 2;
    ctx.stroke();
  };

  Level.prototype.segment = function( x0, y0, x1, y1 ) {
    var segment = new Segment(
      new Endpoint( x0, y0, false, null, 0, true ),
      new Endpoint( x1, y1, false, null, 0, false ),
      0
    );

    segment.start.segment = segment;
    segment.end.segment = segment;

    this.segments.push( segment );
    this.endpoints.push( segment.start );
    this.endpoints.push( segment.end );
  };

  Level.prototype.load = function( size, margin, blocks, walls ) {
    this.segments = [];
    this.endpoints = [];

    this.bounds( size, margin );

    blocks.forEach(function( block ) {
      var x = block.x,
          y = block.y,
          size = block.size;

      this.segment( x - size, y - size, x - size, y + size );
      this.segment( x - size, y + size, x + size, y + size );
      this.segment( x + size, y + size, x + size, y - size );
      this.segment( x + size, y - size, x - size, y - size );
    }, this );

    walls.forEach(function( wall ) {
      this.segment( wall[0], wall[1], wall[2], wall[3] );
    }, this );
  };

  Level.prototype.bounds = function( size, margin ) {
    var min = margin,
        max = size - margin;

    this.segment( min, min, min, max );
    this.segment( min, max, max, max );
    this.segment( max, max, max, min );
    this.segment( max, min, min, min );
  };

  Level.prototype.lightPosition = function( x, y ) {
    this.light.x = x = x ? x : 0;
    this.light.y = y = y ? y : 0;

    this.segments.forEach(function( segment ) {
      segment.distanceSquared = segment.distanceSquaredTo( x, y );

      segment.start.angle = segment.start.angleFrom( x, y );
      segment.end.angle = segment.end.angleFrom( x, y );

      var dAngle = segment.end.angle - segment.start.angle;
      if ( dAngle <= -Math.PI ) { dAngle += Geometry.PI2; }
      if ( dAngle > Math.PI ) { dAngle -= Geometry.PI2; }

      segment.start.begin = dAngle > 0;
      segment.end.begin = !segment.start.begin;
    });
  };

  Level.prototype.sweep = function( maxAngle ) {
    maxAngle = typeof maxAngle !== 'undefined' ? maxAngle : 999;

    this.output = [];
    this.intersections = [];

    this.endpoints.sort(function( a, b ) {
      return a.compare( b );
    });

    this.open = [];

    var startAngle = 0;
    var point, node;
    var previous, current;
    var i, j, il;
    for ( var pass = 0; pass < 2; pass++ ) {
      for ( i = 0, il = this.endpoints.length; i < il; i++ ) {
        point = this.endpoints[i];
        if ( pass === 1 && point.angle > maxAngle ) {
          break;
        }

        previous = this.open[0] || null;

        if ( point.begin ) {
          // Find last node that point.segment is not in front of.
          j = 0;
          do {
            node = this.open[ j++ ];
          } while ( node && point.segment.frontOf( node, this.light ) );

          if ( !node ) {
            this.open.push( point.segment );
          } else {
            insertBefore( this.open, point.segment, node );
          }
        } else {
          remove( this.open, point.segment );
        }

        current = this.open[0] || null;
        if ( previous !== current ) {
          if ( pass === 1 ) {
            this.triangle( startAngle, point.angle, previous );
          }

          startAngle = point.angle;
        }
      }
    }
  };

  Level.prototype.triangle = function( angle0, angle1, segment ) {
    var p0 = this.light,
        p1 = new Point(
          p0.x + Math.cos( angle0 ),
          p0.y + Math.sin( angle0 )
        ),
        p2 = new Point(),
        p3 = new Point();

    if ( segment ) {
      p2.x = segment.start.x;
      p2.y = segment.start.y;
      p3.x = segment.end.x;
      p3.y = segment.end.y;
    } else {
      p2.x = p0.x + Math.cos( angle0 ) * 500;
      p2.y = p0.y + Math.sin( angle0 ) * 500;
      p3.x = p0.x + Math.cos( angle1 ) * 500;
      p3.y = p0.y + Math.sin( angle1 ) * 500;
    }

    var pointBegin = Geometry.lineIntersection(
      p2.x, p2.y,
      p3.x, p3.y,
      p0.x, p0.y,
      p1.x, p1.y
    );

    if ( !pointBegin ) {
      return;
    }

    p1.x = p0.x + Math.cos( angle1 );
    p1.y = p0.y + Math.sin( angle1 );

    var pointEnd = Geometry.lineIntersection(
      p2.x, p2.y,
      p3.x, p3.y,
      p0.x, p0.y,
      p1.x, p1.y
    );

    if ( !pointEnd ) {
      return;
    }

    this.output.push( pointBegin );
    this.output.push( pointEnd );
  };

  return Level;
});
