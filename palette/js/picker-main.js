(function( window, document, undefined ) {
  'use strict';

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  var palettesEl = document.querySelector( '.palettes' );
  var currentPaletteEl;

  var hslEl = document.querySelector( '.hsl' );

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

  // Update background color.
  window.addEventListener( 'mousemove', function( event ) {
    var x = event.pageX,
        y = event.pageY;

    h = x / window.innerWidth * 360;
    s = ( window.innerHeight - y ) / window.innerHeight * 100;

    update();
  });

  window.addEventListener( 'wheel', function( event ) {
    event.preventDefault();
    l = clamp( l - event.deltaY, 0, 100 );
    update();
  });

  update();

  function prependChild( el, child ) {
    el.insertBefore( child, el.firstChild );
  }

  function nodeIndexOf( el ) {
    if ( el.parentNode ) {
      return [].indexOf.call( el.parentNode.childNodes, el );
    }

    return -1;
  }

  // Add color to palette.
  function rectMouseDown( event ) {
    event.stopPropagation();

    var el = event.currentTarget;
    var index, parentIndex;
    if ( el.parentNode ) {
      index = nodeIndexOf( el );

      if ( el.parentNode.parentNode ) {
        parentIndex = nodeIndexOf( el.parentNode );

        // Remove entire palette element if empty.
        if ( !el.parentNode.childNodes.length ) {
          el.parentNode.parentNode.removeChild( el.parentNode );
        }
      }

      el.parentNode.removeChild( el );
      el.removeEventListener( 'mousedown', rectMouseDown );

      if ( index !== -1 && parentIndex !== -1 ) {
        palettes[ parentIndex ].splice( index, 1 );

        if ( !palettes[ parentIndex ].length ) {
          palettes.splice( parentIndex, 1 );
        }
      }
    }
  }

  window.addEventListener( 'mousedown', function() {
    var rectEl = createRectEl( h, s, l );
    rectEl.addEventListener( 'mousedown', rectMouseDown );
    if ( !currentPaletteEl ) {
      currentPaletteEl = createPaletteEl();
      prependChild( palettesEl, currentPaletteEl );
    }

    currentPaletteEl.appendChild( rectEl );

    if ( !palettes.length ) {
      palettes.push( [] );
    }

    palettes[ palettes.length - 1 ].push({
      h: h,
      s: s,
      l: l
    });
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
      var paletteEl = createPaletteEl();

      palette.forEach(function( rect ) {
        var rectEl = createRectEl( rect.h, rect.s, rect.l );
        rectEl.addEventListener( 'mousedown', rectMouseDown );
        paletteEl.appendChild( rectEl );
      });

      prependChild( palettesEl, paletteEl );
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

  function addPalette( event ) {
    currentPaletteEl = createPaletteEl();
    palettesEl.insertBefore( currentPaletteEl, palettesEl.firstChild );
    palettes.push( [] );
  }

  addPaletteBtn.addEventListener( 'click',  addPalette );

  load();

}) ( window, document );
