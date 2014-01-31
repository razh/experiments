/*exported scaleTransform*/
var scaleTransform = (function( window, document, undefined ) {
  'use strict';

  var mat2dRegex = /^matrix\(.*/,
      mat3dRegex = /^matrix3d\(.*/;

  var mat3dPrefix = 'matrix3d(',
      mat2dPrefix = 'matrix(';

  var mat3dPrefixLen = mat3dPrefix.length,
      mat2dPrefixLen = mat2dPrefix.length,
      matSuffixLen   = ')'.length;

  function extractMatrix( str ) {
    var prefixLen;
    if ( str.match( mat3dRegex ) ) {
      prefixLen = mat3dPrefixLen;
    } else if ( str.match( mat2dRegex ) ) {
      prefixLen = mat2dPrefixLen;
    } else {
      return null;
    }

    return str.substring( prefixLen, str.length - matSuffixLen )
      .split( ', ' )
      .map( parseFloat );
  }

  // Returns a function that rounds to a given precision.
  function roundFn( precision ) {
    return function( value ) {
      return parseFloat( value.toFixed( precision ) );
    };
  }

  var roundThousandths = roundFn(3);

  /**
   * Applies a CSS scale transform to all selected elements.
   */
  return function( selector, scale ) {
    var els = [].slice.call( document.querySelectorAll( selector ) );

    els.forEach(function( el ) {
      var computedStyle = window.getComputedStyle( el );
      var transform = computedStyle.webkitTransform || computedStyle.transform;
      var matrix = extractMatrix( transform );

      var prefix;
      // Number of values in the matrix to multiply by scale.
      var scaledCount;
      var scaledTransform;
      if ( !matrix ) {
        scaledTransform = 'scale(' + scale + ')';
      } else if ( matrix.length === 6 ) {
        prefix = mat2dPrefix;
        scaledCount = 4;
      } else if ( matrix.length === 16 ) {
        prefix = mat3dPrefix;
        // Multiply the first three columns by scale.
        scaledCount = 12;
      }

      // Multiply matrix by scale transform.
      if ( scaledCount ) {
        for ( var i = 0; i < scaledCount; i++ ) {
          matrix[i] *= scale;
        }

        matrix = matrix.map( roundThousandths );
        scaledTransform = prefix + matrix.join( ', ' ) + ')';
      }

      el.style.webkitTransform = scaledTransform;
      el.style.transform = scaledTransform;
    });
  };
}) ( window, document );
