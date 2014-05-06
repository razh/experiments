/*globals DepthElement, DepthControls*/
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
    this.elements = [].slice.call( this.el.querySelectorAll( this.selector ) )
      .map(function( element ) {
        return new DepthElement({
          el: element,
          z: parseFloat( element.getAttribute( 'data-z' ) )
        });
      });

    DepthControls.add.apply( null, this.elements );
    DepthControls.on();
  };

  return Depth;

}) ();
