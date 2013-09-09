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
  };

  List.prototype.append = function( data ) {
    var node = new ListNode( data ),
        tail = this.tail;

    node.prev = tail;
    if ( tail ) {
      tail.next = node;
    }

    this.tail = node;
  };

  List.prototype.insertBefore = function( node, data ) {
    if ( !node ) {
      return;
    }

    var newNode = new ListNode( data ),
        prev = node.prev;

    newNode.prev = prev;
    if ( prev ) {
      prev.next = node;
    }

    node.prev = newNode;
    this.next = node;
  };

  List.prototype.remove = function( node ) {
    var prev = node.prev,
        next = node.next;

    if ( prev ) {
      prev.next = next;
    } else {
      this.head = next;
    }

    if ( next ) {
      next.prev = prev;
    }
  };

  List.prototype.clear = function() {
    this.head = null;
  };

  List.prototype.isEmpty = function() {
    return !this.head;
  };

  return List;
});
