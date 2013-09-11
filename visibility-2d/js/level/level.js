/*globals define*/
define([
  'math/geometry',
  'math/point',
  'math/endpoint',
  'math/segment',
  'linked-list/list'
], function( Geometry, Point, Endpoint, Segment, LinkedList ) {
  'use strict';

  function Level() {
    // Level geometry.
    this.segments = [];
    this.endpoints = [];

    // Light.
    this.center = new Point( 0, 0 );

    // Open line segments.
    this.open = new LinkedList();

    this.output = [];
    this.intersections = [];
  }

  Level.prototype.draw = function( ctx ) {
    ctx.beginPath();

    this.segments.forEach(function( segment ) {
      segment.draw( ctx );
    });

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
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
    }.bind( this ));

    walls.forEach(function( wall ) {
      this.segment( wall[0], wall[1], wall[2], wall[3] );
    }.bind( this ));
  };

  Level.prototype.bounds = function( size, margin ) {
    var min = margin,
        max = size - margin;

    this.segment( min, min, min, max );
    this.segment( min, max, max, max );
    this.segment( max, max, max, min );
    this.segment( max, min, min, min );
  };

  Level.prototype.light = function( x, y ) {
    this.center.x = x = x ? x : 0;
    this.center.y = y = y ? y : 0;

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

    this.open.clear();

    var startAngle = 0;
    var point, node;
    var previous, current;
    var i, il;
    for ( var pass = 0; pass < 2; pass++ ) {
      for ( i = 0, il = this.endpoints.length; i < il; i++ ) {
        point = this.endpoints[i];
        if ( pass === 1 && point.angle > maxAngle ) {
          break;
        }

        previous = this.open.isEmpty() ? null : this.open.head.data;

        if ( point.begin ) {
          node = this.open.head;
          while ( node && point.segment.frontOf( node.data, this.center ) ) {
            node = node.next;
          }

          if ( !node ) {
            this.open.append( point.segment );
          } else {
            this.open.insertBefore( node, point.segment );
          }
        } else {
          this.open.remove( this.open.search( point.segment ) );
        }

        current = this.open.isEmpty() ? null : this.open.head.data;
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
    var p0 = this.center,
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

    var pointBegin = Geometry.lineLineIntersection(
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

    var pointEnd = Geometry.lineLineIntersection(
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
