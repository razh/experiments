/*exported Depth*/
var Depth = (function() {
  'use strict';

  function Depth( options ) {
    options = options || {};

    this.el = options.el;
    if ( this.el && typeof this.el === 'string' ) {
      this.el = document.querySelector( this.el );
    }

    if ( !this.el ) {
      return;
    }

    this.selector = options.selector || '.depth';
    this.elements = [];

    this.initialize();
  }

  Depth.prototype.initialize = function() {
    this.elements = [].slice.call( this.el.querySelectorAll( this.selector ) );

    this.elements.forEach(function( element ) {
      var z = element.getAttribute( 'data-z' );
      var transform = 'translateZ(' + z + 'px)';

      element.style.webkitTransform = transform;
      element.style.transform = transform;
    });
  };

  return Depth;

}) ();
