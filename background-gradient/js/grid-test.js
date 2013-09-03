/*globals $, Background, LinearGradient, ColorStop, RGBAColor, randomInt*/
$(function() {
  'use strict';

  var bg00 = new Background(),
      bg01 = new Background(),
      bg02 = new Background(),
      bg03 = new Background(),
      bg04 = new Background(),
      bg05 = new Background(),
      bg06 = new Background(),
      bg07 = new Background(),
      bg08 = new Background(),
      bg09 = new Background(),
      bg10 = new Background(),
      bg11 = new Background(),
      bg12 = new Background(),
      bg13 = new Background(),
      bg14 = new Background(),
      bg15 = new Background();

  function randomGradient() {
    var grad = new LinearGradient();
    var colorStopCount = randomInt( 2, 4 );

    if ( Math.random() > 0.25 ) {
      grad.angle = randomInt( 0, 359 ) + 'deg';
    }

    var colors = [ 0, 128, 255 ];
    for ( var i = 0; i < colorStopCount; i++ ) {
      grad.colorStops.push( new ColorStop( new RGBAColor(
        colors[ Math.round( Math.random() * 2 ) ],
        colors[ Math.round( Math.random() * 2 ) ],
        colors[ Math.round( Math.random() * 2 ) ],
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

  populateBackground( bg00 );
  populateBackground( bg01 );
  populateBackground( bg02 );
  populateBackground( bg03 );
  populateBackground( bg04 );
  populateBackground( bg05 );
  populateBackground( bg06 );
  populateBackground( bg07 );
  populateBackground( bg08 );
  populateBackground( bg09 );
  populateBackground( bg10 );
  populateBackground( bg11 );
  populateBackground( bg12 );
  populateBackground( bg13 );
  populateBackground( bg14 );
  populateBackground( bg15 );

  $( '#gradient-00' ).css({ 'background-image': bg00.css() });
  $( '#gradient-01' ).css({ 'background-image': bg01.css() });
  $( '#gradient-02' ).css({ 'background-image': bg02.css() });
  $( '#gradient-03' ).css({ 'background-image': bg03.css() });
  $( '#gradient-04' ).css({ 'background-image': bg04.css() });
  $( '#gradient-05' ).css({ 'background-image': bg05.css() });
  $( '#gradient-06' ).css({ 'background-image': bg06.css() });
  $( '#gradient-07' ).css({ 'background-image': bg07.css() });
  $( '#gradient-08' ).css({ 'background-image': bg08.css() });
  $( '#gradient-09' ).css({ 'background-image': bg09.css() });
  $( '#gradient-10' ).css({ 'background-image': bg10.css() });
  $( '#gradient-11' ).css({ 'background-image': bg11.css() });
  $( '#gradient-12' ).css({ 'background-image': bg12.css() });
  $( '#gradient-13' ).css({ 'background-image': bg13.css() });
  $( '#gradient-14' ).css({ 'background-image': bg14.css() });
  $( '#gradient-15' ).css({ 'background-image': bg15.css() });

  console.log( bg00.css() );
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

  $gradients.each(function( index, gradient ) {
    var $gradient = $( gradient );

    $gradient.css({
      width: cellWidth,
      height: cellHeight
    });

    $gradient.on( 'click', clickOn );
  });

  function clickOn() {
    var $this = $( this );

    $gradientFullscreen.css({
      'background-image':  $this.css( 'background-image' ),
      'z-index': 1
    });

    $gradients.animate({
      opacity: 0
    });

    $gradientFullscreen.animate({
      opacity: 1
    }, 200, 'swing', function() {
      $gradientFullscreen.on( 'click', clickOut );
    });
  }

  function clickOut() {
    $gradients.animate({
      opacity: 1
    }, 200 );

    $gradientFullscreen.animate({
      opacity: 0
    }, 200, 'swing', function() {
      $gradientFullscreen.css({
        'background-image': '',
        'z-index': -1
      });
    });

    $gradientFullscreen.off( 'click' );
  }
});
