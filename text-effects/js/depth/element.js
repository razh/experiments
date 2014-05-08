/*exported DepthElement*/
var DepthElement = (function() {
  'use strict';

  function DepthElement( options ) {
    options = options || {};

    this.el = options.el;
    if ( this.el && typeof this.el === 'string' ) {
      this.el = document.querySelector( this.el );
    }

    if ( !this.el ) {
      return;
    }

    this.z = options.z;

    this.setTransform();
  }

  DepthElement.prototype.setTransform = function() {
    var transform = 'translateZ(' + this.z + 'px)';

    this.el.style.webkitTransform = transform;
    this.el.style.transform = transform;
  };

  DepthElement.prototype.setBlurRadius = function( blurRadius ) {
    var blur = blurRadius ? 'blur(' + blurRadius + 'px)' : '';

    this.el.style.webkitFilter = blur;
    this.el.style.filter = blur;
  };

  return DepthElement;

}) ();
