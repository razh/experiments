/*exported Splitter*/
var Splitter = (function( window, document, undefined ) {
  'use strict';

  /**
   * Splits up text to a bunch of spans.
   *
   * Use a regex and set 'capture' to true to keep separators.
   */
  function Splitter( options ) {
    options = options || {};

    this.el = options.el;
    if ( !this.el ) {
      return;
    }

    if ( typeof this.el === 'string' ) {
      this.el = document.querySelector( this.el );

      if ( !this.el ) {
        return;
      }
    }

    // WARNING: Separator should be a capturing RegExp if you want to reattach
    // it on to the original string.
    this.separator = options.separator !== undefined ? options.separator : /([\.\?\!])/;
    // If separator is capturing, then set this to true.
    this.capture = options.capture || false;

    this.className = options.className || 'span';
    this.index = options.index || 0;

    this.initialize();
  }

  Splitter.prototype.initialize = function() {
    var textContent = this.el.textContent;
    if ( !textContent ) {
      return;
    }

    var html = textContent.split( this.separator );

    // Reattach separators.
    if ( this.capture ) {
      html = html.reduce(function( array, string, index ) {
        // Append odd-indexed elements to previous element.
        if ( index % 2 ) {
          array[ index - 1 ] += string;
        } else {
          array[ index ] = string;
        }

        return array;
      }, [] );
    }

    // Remove falsy values.
    html = html.filter(function( string ) { return string; })
      // Convert to spans.
      .map(function( string, index ) {
        return '<span class=' +
          this.className + '-' + ( this.index + index ) + '>' +
          string +
        '</span>';
      }, this )
      .join( '' );

    this.el.innerHTML = html;
  };

  return Splitter;

}) ( window, document );
