/*globals $, Background, LinearGradient, ColorStop, RGBAColor, limit, randomInt*/
$(function() {
  'use strict';

  var colCount = 4,
      rowCount = 4,
      backgroundCount = rowCount * colCount,
      backgrounds = [];

  var orderOfMagnitude = Math.ceil( Math.log( backgroundCount ) / Math.LN10 );

  // Number of zeros in the prefix used
  var prefixZeros = (function() {
    var prefix = '';

    for ( var i = 0; i < orderOfMagnitude; i++ ) {
      prefix += '0';
    }

    return prefix;
  }) ();

  /**
   * [getIndexString description]
   */
  function getIndexString( index ) {
    return ( prefixZeros + index ).slice( -orderOfMagnitude );
  }

  var state = {
    colIndex: 0,
    rowIndex: 0
  };

  function randomGradient() {
    var grad = new LinearGradient();
    var colorStopCount = randomInt( 2, 4 );

    if ( Math.random() > 0.25 ) {
      grad.angle = randomInt( 0, 359 ) + 'deg';
    }

    var colors = [ 0, 128, 255 ],
        maxColorIndex = colors.length - 1;

    for ( var i = 0; i < colorStopCount; i++ ) {
      grad.colorStops.push( new ColorStop( new RGBAColor(
        colors[ Math.round( Math.random() * maxColorIndex ) ],
        colors[ Math.round( Math.random() * maxColorIndex ) ],
        colors[ Math.round( Math.random() * maxColorIndex ) ],
        // randomInt( 0, 255 ),
        // randomInt( 0, 255 ),
        // randomInt( 0, 255 ),
        1.0
      )));
    }

    return grad;
  }

  function populateBackground( background ) {
    var gradCount = randomInt( 1, 3 );
    for ( var i = 0; i < gradCount; i++ ) {
      background.gradients.push( randomGradient() );
    }
  }

  // Initialize backgrounds.
  var i;
  for ( i = 0; i < backgroundCount; i++ ) {
    backgrounds.push( new Background() );
  }

  var indexString;
  for ( i = 0; i < backgroundCount; i++ ) {
    populateBackground( backgrounds[i] );
    indexString = getIndexString( i );
    $( '#gradient-' + indexString ).css( 'background-image', backgrounds[i].css() );
  }

  console.log( backgrounds[0].css() );
  console.log( $( '#gradient-00' ).css( 'background-image' ) );

  var $window   = $( window ),
      $document = $( document );

  var $gradientContainer = $( '.gradient-container' ),
      $gradients = $( '.gradient' ),
      $gradientFullscreen = $( '.gradient-fullscreen' ),
      $gradientCursor = $( '.gradient-cursor' );

  function updateCursor( options ) {
    options = options ? options : {};

    var top = options.top || 0,
        left = options.left || 0,

        width = options.width || 0,
        height = options.height || 0;

    $gradientCursor.css({
      top: top,
      left: left,

      width: width,
      height: height
    });
  }

  /**
   * Return jQuery object correspdonding to the gradient element at col and row.
   */
  function getGradientAt( col, row ) {
    var index = row * colCount + col,
        indexString = getIndexString( index );

    return $( '#gradient-' + indexString );
  }

  function getGradientIndex( $gradient ) {
    var id = $gradient.attr( 'id' );

    // Extract number from id.
    var index = parseInt( /(\d+)/.exec( id ), 10 );

    return {
      col: index % rowCount,
      row: Math.floor( index / rowCount )
    };
  }

  function getGradientDimensions( $gradient ) {
    var offset = $gradient.offset();

    return {
      top: offset.top,
      left: offset.left,

      width: $gradient.width(),
      height: $gradient.height()
    };
  }

  function resize() {
    $gradientContainer.css({
      width: $window.width(),
      height: $window.height()
    });

    var cellWidth  = $gradientContainer.width()  / colCount,
        cellHeight = $gradientContainer.height() / rowCount;

    $gradients.each(function( index, gradient ) {
      $( gradient ).css({
        width: cellWidth,
        height: cellHeight
      });
    });

    var $gradient = getGradientAt( state.colIndex, state.rowIndex );
    updateCursor( getGradientDimensions( $gradient ) );
  }

  $window.on( 'resize', resize );

  var duration = 200,
      easing   = 'swing';

  function enterFullscreenWithBackgroundImage( backgroundImage ) {
    console.log( backgroundImage );

    $gradientFullscreen.css({
      'background-image': backgroundImage,
      'z-index': 1
    });

    $gradients.animate({ opacity: 0 });
    $gradientCursor.css({ opacity: 0 });

    $document.off( 'keydown.navigate' );
    $gradientFullscreen.animate({
      opacity: 1
    }, duration, easing, function() {
      // Exit fullscreen on click.
      $gradientFullscreen.on( 'click', exitFullscreen );

      // Exit on ESC as well.
      $document.on( 'keydown.fullscreen', function( event ) {
        if ( event.which === 27 ) {
          exitFullscreen();
        }
      });
    });
  }

  // Fullscreen on click.
  $gradients.each(function( index, gradient ) {
    var $gradient = $( gradient );

    $gradient.on( 'click', function() {
      // Set new cursor position.
      updateCursor( getGradientDimensions( $gradient ) );

      var index = getGradientIndex( $gradient );
      state.colIndex = index.col;
      state.rowIndex = index.row;

      enterFullscreenWithBackgroundImage( $gradient.css( 'background-image' ) );
    });
  });

  function exitFullscreen() {
    $gradients.animate({ opacity: 1 }, duration );
    $gradientCursor.animate({ opacity: 1 }, duration );

    $gradientFullscreen.animate({
      opacity: 0
    }, duration, easing, function() {
      $gradientFullscreen.css({
        'background-image': '',
        'z-index': -1
      });
    });

    $gradientFullscreen.off( 'click' );
    $document.off( 'keydown.fullscreen' );
    $document.on( 'keydown.navigate', onKeyDown );
  }

  function onKeyDown( event ) {
    var colIndex, rowIndex,
        $gradient;

    if ( event.which === 13 ) {
      $gradient = getGradientAt( state.colIndex, state.rowIndex );
      enterFullscreenWithBackgroundImage( $gradient.css( 'background-image' ) );
    } else {
      colIndex = state.colIndex;
      rowIndex = state.rowIndex;

      // Left.
      if ( event.which === 37 ) { state.colIndex--; }
      // Top.
      else if ( event.which === 38 ) { state.rowIndex--; }
      // Right.
      else if ( event.which === 39 ) { state.colIndex++; }
      // Bottom.
      else if ( event.which === 40 ) { state.rowIndex++; }

      state.colIndex = limit( state.colIndex, 0, colCount - 1 );
      state.rowIndex = limit( state.rowIndex, 0, rowCount - 1 );

      // Update if indices have changed.
      if ( state.colIndex !== colIndex ||
           state.rowIndex !== rowIndex  ) {
        updateCursor( getGradientDimensions( getGradientAt( state.colIndex, state.rowIndex ) ) );
      }
    }
  }

  $document.on( 'keydown.navigate', onKeyDown );
});
