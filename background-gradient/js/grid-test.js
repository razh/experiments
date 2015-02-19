/*globals Background, LinearGradient, ColorStop, RGBAColor, clamp, randomInt*/
(function( window, document, undefined ) {
  'use strict';

  var colCount = 4,
      rowCount = 4,
      backgroundCount = rowCount * colCount,
      backgrounds = [];

  var state = {
    colIndex: 0,
    rowIndex: 0
  };

  var gradientContainer  = document.querySelector( '.gradient-container'  ),
      gradientCursor     = document.querySelector( '.gradient-cursor'     ),
      gradientFullscreen = document.querySelector( '.gradient-fullscreen' );

  var gradients;

  // Gradient generation.
  function randomGradient() {
    var gradient = new LinearGradient();
    var colorStopCount = randomInt( 2, 4 );

    if ( Math.random() > 0.25 ) {
      gradient.angle = randomInt( 0, 359 ) + 'deg';
    }

    var colors = [ 0, 128, 255 ],
        maxColorIndex = colors.length - 1;

    for ( var i = 0; i < colorStopCount; i++ ) {
      gradient.colorStops.push( new ColorStop( new RGBAColor(
        colors[ Math.round( Math.random() * maxColorIndex ) ],
        colors[ Math.round( Math.random() * maxColorIndex ) ],
        colors[ Math.round( Math.random() * maxColorIndex ) ],
        // randomInt( 0, 255 ),
        // randomInt( 0, 255 ),
        // randomInt( 0, 255 ),
        1.0
      )));
    }

    return gradient;
  }

  function populateBackground( background ) {
    var gradCount = randomInt( 1, 3 );
    for ( var i = 0; i < gradCount; i++ ) {
      background.gradients.push( randomGradient() );
    }
  }


  /**
   * Return the gradient element at col and row.
   */
  function getGradientAt( col, row ) {
    var index = row * colCount + col;
    return document.querySelector( '#gradient-' + index );
  }

  function getGradientIndex( gradient ) {
    // Extract number from id.
    var index = parseInt( /(\d+)/.exec( gradient.id ), 10 );

    return {
      col: index % rowCount,
      row: Math.floor( index / rowCount )
    };
  }

  function updateCursor( rect ) {
    rect = rect || {};

    var transform = 'translate3d(' +
      ( rect.left || 0 ) + 'px, ' +
      ( rect.top  || 0 ) + 'px, 0)';

    gradientCursor.style.webkitTransform = transform;
    gradientCursor.style.transform = transform;

    gradientCursor.style.width  = ( rect.width  || 0 ) + 'px';
    gradientCursor.style.height = ( rect.height || 0 ) + 'px';
  }

  function resize() {
    var gradient = getGradientAt( state.colIndex, state.rowIndex );
    updateCursor( gradient.getBoundingClientRect() );
  }


  function enterFullscreenWithBackgroundImage( backgroundImage ) {
    console.log( backgroundImage );

    gradientContainer.style.opacity = 0;
    gradientCursor.style.opacity = 0;

    gradientFullscreen.style.opacity = 1;
    gradientFullscreen.style.pointerEvents = 'all';
    gradientFullscreen.style.backgroundImage = backgroundImage;

    document.removeEventListener( 'keydown', onKeyDown );

    // Exit fullscreen on click or ESC/Space.
    gradientFullscreen.addEventListener( 'click', exitFullscreen );
    document.addEventListener( 'keydown', onKeyDownExitFullScreen );
  }

  function exitFullscreen() {
    gradientContainer.style.opacity = 1;
    gradientCursor.style.opacity = 1;

    gradientFullscreen.style.opacity = 0;
    gradientFullscreen.style.pointerEvents = 'none';

    // Remove fullscreen listeners.
    gradientFullscreen.removeEventListener( 'click', exitFullscreen );
    document.removeEventListener( 'keydown', onKeyDownExitFullScreen );

    document.addEventListener( 'keydown', onKeyDown );
  }


  function onKeyDown( event ) {
    var colIndex, rowIndex,
        gradient;

    // Space.
    if ( event.keyCode === 32 ) {
      gradient = getGradientAt( state.colIndex, state.rowIndex );
      enterFullscreenWithBackgroundImage( gradient.style.backgroundImage );
    } else {
      // Previous column and row indices.
      colIndex = state.colIndex;
      rowIndex = state.rowIndex;

      // Left.
      if ( event.keyCode === 37 ) { state.colIndex--; }
      // Top.
      else if ( event.keyCode === 38 ) { state.rowIndex--; }
      // Right.
      else if ( event.keyCode === 39 ) { state.colIndex++; }
      // Bottom.
      else if ( event.keyCode === 40 ) { state.rowIndex++; }

      state.colIndex = clamp( state.colIndex, 0, colCount - 1 );
      state.rowIndex = clamp( state.rowIndex, 0, rowCount - 1 );

      // Update if indices have changed.
      if ( state.colIndex !== colIndex ||
           state.rowIndex !== rowIndex  ) {
        gradient = getGradientAt( state.colIndex, state.rowIndex );
        updateCursor( gradient.getBoundingClientRect() );
      }
    }
  }

  function onKeyDownExitFullScreen( event ) {
    // ESC or Space.
    if ( event.keyCode === 27 ||
         event.keyCode === 32 ) {
      exitFullscreen();
    }
  }


  // Initialize.
  (function() {
    // Initialize backgrounds.
    var background, gradient;
    for ( var i = 0; i < backgroundCount; i++ ) {
      background = new Background();
      populateBackground( background );
      backgrounds.push( background );

      gradient = document.createElement( 'div' );
      gradient.className = 'gradient';
      gradient.id = 'gradient-' + i;
      gradient.style.width  = ( 100 / colCount ) + '%';
      gradient.style.height = ( 100 / rowCount ) + '%';
      gradient.style.backgroundImage = background.css();

      gradientContainer.appendChild( gradient );
    }

    console.log( backgrounds[0].css() );
    console.log( document.querySelector( '#gradient-0' ).style.backgroundImage );

    gradients = [].slice.call( document.querySelectorAll( '.gradient' ) );

    // Fullscreen on click.
    gradients.forEach(function( gradient ) {
      gradient.addEventListener( 'click', function() {
        // Set new cursor position.
        updateCursor( gradient.getBoundingClientRect() );

        var index = getGradientIndex( gradient );
        state.colIndex = index.col;
        state.rowIndex = index.row;

        enterFullscreenWithBackgroundImage( gradient.style.backgroundImage );
      });
    });

    document.addEventListener( 'keydown', onKeyDown );
    window.addEventListener( 'resize', resize );
    resize();

  }) ();

}) ( window, document );
