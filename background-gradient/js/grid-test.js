/*globals $, Background, LinearGradient, ColorStop, RGBAColor, randomInt*/
$(function() {
  'use strict';

  var backgroundCount = 16,
      backgrounds = [];

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
    indexString = i.toString();
    indexString = ( indexString.length < 2 ) ? '0' + indexString : indexString;
    $( '#gradient-' + indexString ).css( 'background-image', backgrounds[i].css() );
  }

  console.log( backgrounds[0].css() );
  console.log( $( '#gradient-00' ).css( 'background-image' ) );

  var $window = $( window );

  var $gradientContainer = $( '.gradient-container' ),
      $gradients = $( '.gradient' ),
      $gradientFullscreen = $( '.gradient-fullscreen' );

  $gradientContainer.css({
    width: $window.width(),
    height: $window.height()
  });

  var cellWidth = 0.25 * $gradientContainer.width(),
      cellHeight = 0.25 * $gradientContainer.height();

  var duration = 200;

  $gradients.each(function( index, gradient ) {
    var $gradient = $( gradient );

    $gradient.css({
      width: cellWidth,
      height: cellHeight
    });

    $gradient.on( 'click', function() {
      console.log( $gradient.css( 'background-image' ) );

      $gradientFullscreen.css({
        'background-image':  $gradient.css( 'background-image' ),
        'z-index': 1
      });

      $gradients.animate({
        opacity: 0
      });

      $gradientFullscreen.animate({
        opacity: 1
      }, duration, 'swing', function() {
        $gradientFullscreen.on( 'click', clickOut );
      });
    });
  });

  function clickOut() {
    $gradients.animate({
      opacity: 1
    }, duration );

    $gradientFullscreen.animate({
      opacity: 0
    }, duration, 'swing', function() {
      $gradientFullscreen.css({
        'background-image': '',
        'z-index': -1
      });
    });

    $gradientFullscreen.off( 'click' );
  }
});
