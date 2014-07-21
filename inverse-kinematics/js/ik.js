/*exported IK*/
var IK = (function() {
  'use strict';

  function Link( length, angle ) {
    this.length = length || 0;
    this.angle = angle || 0;

    this.x = 0;
    this.y = 0;
  }

  function length( ik ) {
    return ik.links.reduce(function( length, link ) {
      return length + link.length;
    }, 0 );
  }

  function calculate( ik ) {
    var link;
    var next;
    var dx, dy;
    for ( var i = 0, il = ik.links.length; i < il; i++ ) {
      link = ik.links[i];
      next = ik.links[ i + 1 ];

      dx = link.x + Math.cos( link.angle ) * link.length;
      dy = link.y + Math.sin( link.angle ) * link.length;

      if ( next ) {
        next.x = dx;
        next.y = dy;
      } else {
        // Set end effector position.
        ik.xf = dx;
        ik.yf = dy;
      }
    }
  }

  function draw( ctx, ik ) {
    var x = ik.x,
        y = ik.y;

    ctx.moveTo( x, y );

    var link;
    for ( var i = 0, il = ik.links.length; i < il; i++ ) {
      link = ik.links[i];

      x += Math.cos( link.angle ) * link.length;
      y += Math.sin( link.angle ) * link.length;

      ctx.lineTo( x, y );
    }
  }

  function drawPath( ctx, ik ) {
    ctx.save();

    ctx.translate( ik.x, ik.y );
    ctx.moveTo( 0, 0 );

    var link;
    for ( var i = 0, il = ik.links.length; i < il; i++ ) {
      link = ik.links[i];
      ctx.lineTo( link.x, link.y );
    }

    ctx.lineTo( ik.xf, ik.yf );

    ctx.restore();
  }

  function remove( ik, link ) {
    var index = ik.links.indexOf( link );

    if ( index !== -1 ) {
      ik.links.splice( index, 1 );
    }
  }

  function toArray( ik ) {
    return ik.links.map(function( link ) {
      return link.length;
    });
  }

  /**
   * Generates an initially horizontal system from an array of link/bone
   * lengths.
   */
  function fromArray( ik, array ) {
    if ( !array.length ) {
      return ik;
    }

    ik.links = array.reduce(function( links, length, index ) {
      var link = new Link( length );

      // Set initial position of link.
      var prev;
      if ( links.length ) {
        prev = links[ index - 1 ];
        link.x = prev.x + prev.length;
      }

      links.push( link );
      return links;
    }, [] );

    // Set end effector position.
    var last = ik.links[ ik.links.length - 1 ];
    ik.xf = last.x + last.length;
    ik.yf = 0;

    return ik;
  }

  /**
   * Generate an array of numbers from a comma-separated string of numbers.
   */
  function parseString( string ) {
    return string.split( ',' )
      .map( parseFloat )
      .filter(function( value ) {
        return value && isFinite( value );
      });
  }

  return {
    Link: Link,
    length: length,
    calculate: calculate,
    draw: draw,
    drawPath: drawPath,
    remove: remove,

    toArray: toArray,
    fromArray: fromArray,
    parseString: parseString
  };

}) ();
