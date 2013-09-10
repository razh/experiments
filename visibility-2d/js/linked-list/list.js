/*globals define*/
define([
  'linked-list/list-node'
], function( ListNode ) {
  'use strict';

  function List() {
    this.head = null;
    this.tail = null;
  }

  List.prototype.search = function( data ) {
    var current = this.head;

    while ( current && current.data !== data ) {
      current = current.next;
    }

    return current;
  };

  List.prototype.prepend = function( data ) {
    var node = new ListNode( data ),
        head = this.head;

    node.next = head;
    if ( head ) {
      head.prev = node;
    }

    this.head = node;
    if ( !this.tail ) {
      this.tail = node;
    }
  };

  List.prototype.append = function( data ) {
    var node = new ListNode( data ),
        tail = this.tail;

    node.prev = tail;
    if ( tail ) {
      tail.next = node;
    }

    this.tail = node;
    if ( !this.head ) {
      this.head = node;
    }
  };

  List.prototype.insertBefore = function( node, data ) {
    if ( !node ) {
      return;
    }

    var newNode = new ListNode( data ),
        prev = node.prev;

    newNode.prev = prev;
    if ( prev ) {
      prev.next = newNode;
    } else {
      this.head = newNode;
    }

    node.prev = newNode;
    newNode.next = node;
  };

  List.prototype.insertAfter = function( node, data ) {
    if ( !node ) {
      return;
    }

    var newNode = new ListNode( data ),
        next = node.next;

    newNode.next = next;
    if ( next ) {
      next.prev = newNode;
    } else {
      this.tail = newNode;
    }

    node.next = newNode;
    newNode.prev = node;
  };

  List.prototype.remove = function( node ) {
    if ( !node ) {
      return;
    }

    var prev = node.prev,
        next = node.next;

    if ( prev ) {
      prev.next = next;
    } else {
      this.head = next;
    }

    if ( next ) {
      next.prev = prev;
    } else {
      this.tail = prev;
    }

    return true;
  };

  // We could store it, but we're lazy.
  List.prototype.size = function() {
    var count = 0,
        current = this.head;

    while ( current ) {
      count++;
      current = current.next;
    }

    return count;
  };

  List.prototype.clear = function() {
    this.head = null;
    this.tail = null;
  };

  List.prototype.isEmpty = function() {
    return !this.head;
  };

  List.prototype.toArray = function() {
    var array = [];

    var current = this.head;
    while ( current ) {
      array.push( current.data );
      current = current.next;
    }

    return array;
  };

  return List;
});
