/*jshint bitwise:false*/
(function( window ) {
  'use strict';

  var Quadtree = window.Quadtree;

  /**
   * WARNING: You really don't need to use this. Modern JS garbage collectors
   * appear to handle the creation of hundreds of Quadtree nodes per frame with
   * relative ease.
   */
  function QuadtreePool() {
    Quadtree.apply( this, arguments );
  }

  QuadtreePool.pool = [];

  QuadtreePool.prototype = new Quadtree();
  QuadtreePool.prototype.constructor = QuadtreePool;

  QuadtreePool.prototype.clear = function() {
    this.objects = [];

    this.children.forEach(function( child ) {
      child.clear();
      QuadtreePool.pool.push( child );
    });

    this.children = [];
  };

  QuadtreePool.prototype.insert = function( object ) {
    var x = object.x,
        y = object.y;

    if ( this.contains( x, y ) ) {
      if ( this.halfSize <= this.minSize ) {
        this.objects.push( object );
        return true;
      } else {
        var quadrant = this.quadrantOf( x - this.x, y - this.y );
        if ( !this.children[ quadrant ] ) {

          var quadtree;
          if ( QuadtreePool.pool.length ) {
            quadtree = QuadtreePool.pool.pop();
          } else {
            quadtree = new QuadtreePool();
          }

          QuadtreePool.call(
            quadtree,
            this.x + ( ( quadrant & 1 ) ? this.halfSize : 0 ),
            this.y + ( ( quadrant & 2 ) ? this.halfSize : 0 ),
            this.halfSize,
            this
          );

          this.children[ quadrant ] = quadtree;
        }

        return this.children[ quadrant ].insert( object );
      }
    }

    return false;
  };

  window.QuadtreePool = QuadtreePool;
}) ( window );
