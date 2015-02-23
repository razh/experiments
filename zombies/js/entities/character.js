/*global Entity*/
/*exported Character*/
var Character = (function() {
  'use strict';

  function Character( x, y ) {
    Entity.call( this, x, y, 2, 2 );
    this.speed = 0;
  }

  Character.prototype = new Entity();
  Character.prototype.constructor = Character;

  return Character;
}) ();
