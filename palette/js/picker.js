(function( window, document, undefined ) {
  'use strict';

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  var hslEl = document.querySelector( '.hsl' );
  var palettesEl = document.querySelector( '.palettes' );
  var colorEl = document.querySelector( '.color' );
  var currentPaletteEl;

  var addPaletteBtn = document.querySelector( '.add-palette-btn' );

  var palettes = [];

  var h = 0,
      s = 50,
      l = 50;

  function hslString( h, s, l ) {
    return 'hsl(' +
      Math.round( h ) + ', ' +
      Math.round( s ) + '%, ' +
      Math.round( l ) + '%)';
  }

  function update() {
    var hsl = hslString( h, s, l );

    document.body.style.backgroundColor = hsl;
    hslEl.textContent = hsl;
  }

  update();

  // Update background color.
  colorEl.addEventListener( 'mousemove', function( event ) {
    var rect = colorEl.getBoundingClientRect();

    var x = event.pageX - rect.left,
        y = event.pageY - rect.top;

    h = x / rect.width * 360;
    s = ( rect.height - y ) / rect.height * 100;

    update();
  });

  window.addEventListener( 'wheel', function( event ) {
    if ( !event.deltaY ) {
      return;
    }

    event.preventDefault();
    l = clamp( l - event.deltaY, 0, 100 );
    update();
  });

  function nodeIndexOf( el ) {
    if ( el.parentNode ) {
      return [].indexOf.call( el.parentNode.childNodes, el );
    }

    return -1;
  }

  function logPalettes() {
    var str = '';

    palettes.forEach(function( palette, index, array ) {
      // Log a '*' for each palette.
      str += '[: ' + new Array( palette.length + 1 ).join( '*' );

      if ( index < array.length - 1 ) {
        str += '\n';
      }
    });

    console.log( str );
  }

  // Add color to palette.
  function rectMouseDown( event ) {
    event.stopPropagation();

    var el = event.currentTarget;
    var parentEl = el.parentNode;
    var grandparentEl;
    var index, parentIndex;
    if ( parentEl ) {
      index = nodeIndexOf( el );

      if ( parentEl.parentNode ) {
        parentIndex = nodeIndexOf( parentEl );
      }

      parentEl.removeChild( el );
      el.removeEventListener( 'mousedown', rectMouseDown );

      // Remove entire palette element if it's empty.
      grandparentEl = parentEl.parentNode;
      if ( grandparentEl && !parentEl.childNodes.length ) {
        grandparentEl.removeChild( parentEl );
        currentPaletteEl = grandparentEl.lastChild;
      }

      if ( index !== -1 && parentIndex !== -1 ) {
        console.log( '[' + parentIndex + ', ' + index + ']' );
        palettes[ parentIndex ].splice( index, 1 );

        if ( !palettes[ parentIndex ].length ) {
          palettes.splice( parentIndex, 1 );
        }

        logPalettes();
      }
    }
  }

  colorEl.addEventListener( 'mousedown', function() {
    if ( !palettes.length ) {
      addPalette();
    }

    var rectEl = createRectEl( h, s, l );
    rectEl.addEventListener( 'mousedown', rectMouseDown );
    currentPaletteEl.appendChild( rectEl );

    palettes[ palettes.length - 1 ].push({
      h: h,
      s: s,
      l: l
    });

    logPalettes();
  });

  // Laod/save.
  /**
   * Returns an array of saved palettes.
   */
  function getSavedPalettes() {
    var savedPalettes = window.localStorage.getItem( 'palettes' );
    savedPalettes = savedPalettes ? JSON.parse( savedPalettes ) : [];
    return savedPalettes;
  }

  function load() {
    palettes = getSavedPalettes();

    palettes.forEach(function( palette ) {
      if ( !palette.length ) {
        return;
      }

      currentPaletteEl = createPaletteEl();

      palette.forEach(function( rect ) {
        var rectEl = createRectEl( rect.h, rect.s, rect.l );
        rectEl.addEventListener( 'mousedown', rectMouseDown );
        currentPaletteEl.appendChild( rectEl );
      });

      palettesEl.appendChild( currentPaletteEl );
    });
  }

  window.addEventListener( 'beforeunload', function() {
    palettes = palettes.filter(function( palette ) {
      return palette.length;
    });

    window.localStorage.setItem( 'palettes', JSON.stringify( palettes ) );
  });

  function createPaletteEl() {
    var paletteEl = document.createElement( 'div' );
    paletteEl.classList.add( 'palette', 'clearfix' );
    return paletteEl;
  }

  function createRectEl( h, s, l ) {
    var rectEl = document.createElement( 'div' );

    var hsl = hslString( h, s, l );
    rectEl.classList.add( 'rect' );
    rectEl.style.backgroundColor = hsl;
    rectEl.setAttribute( 'data-background-color', hsl );

    return rectEl;
  }

  function addPalette() {
    currentPaletteEl = createPaletteEl();
    palettesEl.appendChild( currentPaletteEl );
    palettes.push( [] );
  }

  addPaletteBtn.addEventListener( 'mousedown',  function( event ) {
    event.stopPropagation();
    // Don't add if the last palette is already empty.
    if ( palettes.length && !palettes[ palettes.length - 1 ].length ) {
      return;
    }

    addPalette();
  });

  load();

}) ( window, document );
