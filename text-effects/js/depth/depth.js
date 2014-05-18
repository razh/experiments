/*globals DepthElement, DepthControls*/
/*exported Depth*/
var Depth = (function() {
  'use strict';

  function elementOption( el ) {
    if ( el && typeof el === 'string' ) {
      return document.querySelector( el );
    }

    return el;
  }

  function Depth( options ) {
    options = options || {};

    this.container = elementOption( options.container );
    this.el = elementOption( options.el );
    if ( !this.el ) {
      return;
    }

    this.selector = options.selector || '.depth';
    this.elements = [];

    this.aperture = options.aperture || ( 1 / 50 );
    this.z = options.z || -100;

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
    DepthControls.on( 'update', this.update.bind( this ) );
    this.update();
  };

  Depth.prototype.update = function() {
    this.elements.forEach(function( element ) {
      var blurRadius = this.calculateBlurRadius( element.z );
      element.setBlurRadius( blurRadius );
      element.el.setAttribute( 'data-blur', blurRadius.toFixed(2) );
    }, this );
  };

  Depth.prototype.calculateBlurRadius = function( z ) {
    return this.aperture * Math.abs( z - this.z );
  };

  return Depth;

}) ();
