/*globals angleGradient, requestAnimationFrame*/
(function() {
  'use strict';

  var startAngle = 0,
      endAngle = 360;

  // Milliseconds.
  var startTime;
  var duration = 1000;

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function easeInOutCirc( t ) {
    function easeInCirc( t ) {
      return 1 - Math.sqrt( 1 - t * t );
    }

    return t < 0.5 ?
      easeInCirc( t * 2 ) / 2 :
      1 - easeInCirc( t * -2 + 2 ) / 2;
  }

  function drawGradients( angle ) {
    angleGradient( '.circle', {
      x: '50%',
      y: '50%',
      startAngle: angle + 'deg',
      colorStops: [
        { angle: '45deg', color: 'rgb(0, 0, 0)' },
        { color: 'rgba(0, 0, 0, 0)' }
      ]
    });
  }

  function draw() {
    var dt = Date.now() - startTime;
    if ( dt > duration ) {
      drawGradients(0);
      return;
    }

    var t = dt / duration;
    var angle = lerp( endAngle, startAngle, easeInOutCirc( t ) );
    drawGradients( angle );

    requestAnimationFrame( draw );
  }

  window.addEventListener( 'mousedown', function() {
    startTime = Date.now();
    draw(0);
  });

  drawGradients(0);
}) ();
