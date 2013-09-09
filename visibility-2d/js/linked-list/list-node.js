/*globals define*/
define(function() {
  'use strict';

  function ListNode( data ) {
    this.data = data || null;
    this.prev = null;
    this.next = null;
  }

  return ListNode;
});
