/*globals DEG_TO_RAD, Background, LinearGradient, ColorStop, RGBAColor*/
(function( window, document, undefined ) {
  'use strict';

  /**
   * Returns the canvas version of a linear gradient.
   * Does not handle custom positions.
   */
  LinearGradient.prototype.canvas = function( ctx, totalAlpha ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var endPoints = this.endPointsFromAngle( width, height );

    var x0 = endPoints[0],
        y0 = endPoints[1],
        x1 = endPoints[2],
        y1 = endPoints[3];

    var gradient = ctx.createLinearGradient( x0, y0, x1, y1 );

    var lastIndex = this.colorStops.length - 1;
    this.colorStops.forEach(function( colorStop, index ) {
      gradient.addColorStop( index / lastIndex, colorStop.color.css( totalAlpha ) );
    });

    return gradient;
  };

  LinearGradient.prototype.drawDebug = function( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var endPoints = this.endPointsFromAngle( width, height );

    var x0 = endPoints[0],
        y0 = endPoints[1],
        x1 = endPoints[2],
        y1 = endPoints[3];

    // Draw debug.
    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    ctx.save();

    ctx.translate( halfWidth, halfHeight );
    ctx.scale( 0.5, 0.5 );
    ctx.translate( -halfWidth, -halfHeight );

    // Draw bounding rect.
    ctx.beginPath();
    ctx.rect( 0, 0, width, height );
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#0f0';
    ctx.stroke();

    // Draw gradient line.
    ctx.beginPath();
    ctx.moveTo( x0, y0 );
    ctx.lineTo( x1, y1 );

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#f00';
    ctx.stroke();

    ctx.restore();
  };

  /**
   * Given the width and height of the gradient area, determine the endpoints
   * of the gradient line.
   *
   * Code taken from WebKit source code.
   */
  LinearGradient.prototype.endPointsFromAngle = function( width, height ) {
    var angle = parseInt( this.angle, 10 );

    if ( isNaN( angle ) ) {
      angle = 180;
    }

    // Limit to [0, 360).
    angle %= 360;
    if ( angle < 0 ) {
      angle += 360;
    }

    // 0 degrees.
    if ( !angle ) {
      return [
        0, height,
        0, 0
      ];
    }

    if ( angle === 90 ) {
      return [
        0, 0,
        width, 0
      ];
    }

    if ( angle === 180 ) {
      return [
        0, 0,
        0, height
      ];
    }

    if ( angle === 270 ) {
      return [
        width, 0,
        0, 0
      ];
    }

    var slope = Math.tan( ( 90 - angle ) * DEG_TO_RAD ),
        perpendicularSlope = -1 / slope;

    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    // Determine the starting corner relative to the center.
    // Note that positive-y is up.
    var x, y;
    if ( angle < 90 ) {
      x = halfWidth;
      y = halfHeight;
    } else if ( angle < 180 ) {
      x =  halfWidth;
      y = -halfHeight;
    } else if ( angle < 270 ) {
      x = -halfWidth;
      y = -halfHeight;
    } else {
      x = -halfWidth;
      y =  halfHeight;
    }

    var yIntercept = y - perpendicularSlope * x;

    var dx = yIntercept / ( slope - perpendicularSlope ),
        dy = perpendicularSlope * dx + yIntercept;

    // Flip dy for canvas drawing space.
    return [
      halfWidth - dx, halfHeight + dy,
      halfWidth + dx, halfHeight - dy
    ];
  };

  Background.prototype.canvas = function( ctx ) {
    var totalAlpha = this.totalAlpha();

    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var gradientsReverse = this.gradients.slice().reverse();

    gradientsReverse.forEach(function( gradient ) {
      ctx.fillStyle = gradient.canvas( ctx, totalAlpha );
      ctx.fillRect( 0, 0, width, height );
    });
  };

  Background.prototype.drawDebug = function( ctx ) {
    this.gradients.forEach(function( gradient ) {
      gradient.drawDebug( ctx );
    });
  };


  /**
   * Utility method to quickly create a Background from an array of gradient
   * data, where each gradient object has an angle and a bunch of colorstops.
   */
  function createBackground( data ) {
    var background = new Background();

    data.forEach(function( gradientData ) {
      var gradient = new LinearGradient();

      gradient.angle = gradientData.angle || '';
      gradientData.colorStops.forEach(function( colorStopData ) {
        var colorStop = new ColorStop(
          new RGBAColor(
            colorStopData[0],
            colorStopData[1],
            colorStopData[2],
            colorStopData[3]
          )
        );

        colorStop.position = colorStopData[4] || '';
        gradient.colorStops.push( colorStop );
      });

      background.gradients.push( gradient );
    });

    return background;
  }

  function drawDiff( ctx, backgroundNormal, backgroundDiff ) {
    ctx.globalCompositeOperation = 'normal';
    backgroundNormal.canvas( ctx );

    ctx.globalCompositeOperation = 'difference';
    backgroundDiff.canvas( ctx );
  }

  function calculateDiff( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var imageData = ctx.getImageData( 0, 0, width, height ).data;

    var r, g, b;
    var diff = 0;
    for ( var i = 0, il = imageData.length; i < il; i += 4 ) {
      r = imageData[ i ];
      g = imageData[ i + 1 ];
      b = imageData[ i + 2 ];

      diff += r + g + b;
    }

    return diff;
  }

  // Utility to toggle float: left on gradient elements.
  (function() {
    var pullLeftInput = document.getElementById( 'pull-left-input' );

    pullLeftInput.addEventListener( 'change', function() {
      document.body.classList.toggle( 'pull-left', pullLeftInput.checked );
    });
  }) ();

  // Syntax explorations.
  (function() {
    var el = document.querySelector( '.syntax' );

    var gradientCanvas = el.querySelector( '.gradient-canvas' ),
        gradientCtx    = gradientCanvas.getContext( '2d' );

    var WIDTH  = 640,
        HEIGHT = 480;

    gradientCanvas.width  = WIDTH;
    gradientCanvas.height = HEIGHT;

    var grad = gradientCtx.createLinearGradient( 0, 0, 0, HEIGHT );
    grad.addColorStop( 0, 'black' );
    grad.addColorStop( 1, 'white' );

    gradientCtx.fillStyle = grad;
    gradientCtx.fillRect( 0, 0, WIDTH, HEIGHT );
  }) ();

  // Test converting to CSS and canvas linear gradients.
  (function() {
    var el = document.querySelector( '.conversion' );

    var gradientCSS = el.querySelector( '.gradient-css' );

    var gradientCanvas = el.querySelector( '.gradient-canvas' ),
        gradientCtx    = gradientCanvas.getContext( '2d' );

    gradientCanvas.width  = 640;
    gradientCanvas.height = 480;

    // Test data.
    var data = [
      {
        angle: '45deg',
        colorStops: [
          [ 255, 0, 0, 1.0 ],
          [ 255, 255, 128, 1.0 ]
        ]
      },
      {
        angle: '',
        colorStops: [
          [ 240, 128, 128, 1.0 ],
          [ 127, 0, 127, 1.0 ]
        ]
      },
      {
        angle: '215deg',
        colorStops: [
          [ 128, 128, 128, 1.0 ],
          [ 240, 128, 128, 1.0 ]
        ]
      }
    ];

    var background = createBackground( data );

    gradientCSS.style.backgroundImage = background.css();
    background.canvas( gradientCtx );
  }) ();


  // Test gradient line determination for canvas.
  (function() {
    var el = document.querySelector( '.angle' );

    var gradientCSS = el.querySelector( '.gradient-css' );

    var gradientCanvas = el.querySelector( '.gradient-canvas' ),
        gradientCtx    = gradientCanvas.getContext( '2d' );

    var inputAngle = el.querySelector( '#input-angle' );

    gradientCanvas.width  = 640;
    gradientCanvas.height = 480;

    var data = [{
      angle: '30deg',
      colorStops: [
        [ 128, 128, 128, 1.0 ],
        [ 240, 128, 128, 1.0 ],
        [ 0, 0, 128, 1.0 ],
        [ 0, 128, 128, 1.0 ],
        [ 255, 255, 128, 1.0 ]
      ]
    }];

    function updateBackground() {
      var background = createBackground( data );

      gradientCSS.style.backgroundImage = background.css();
      background.canvas( gradientCtx );
      background.drawDebug( gradientCtx );
    }

    updateBackground();

    // Update gradient angle based on input.
    function update() {
      var angle = parseInt( inputAngle.value, 10 );
      angle %= 360;
      if ( angle < 0 ) {
        angle += 360;
      }

      inputAngle.value = angle;

      data[0].angle = angle + 'deg';
      updateBackground();
    }

    inputAngle.addEventListener( 'input', update );

    // Prevent form submission.
    inputAngle.addEventListener( 'keydown', function( event ) {
      if ( event.which === 13 ) {
        event.preventDefault();
        update();
      }
    });
  }) ();

  // Test diff.
  (function() {
    // Offscreen canvas.
    var canvas  = document.createElement( 'canvas' ),
        context = canvas.getContext( '2d' );

    var gradDataA = [{
      colorStops: [
        [ 128, 128, 128, 1.0 ],
        [ 255, 128, 128, 1.0 ],
      ]
    }];

    var gradDataB = [{
      colorStops: [
        [ 255, 128, 128, 1.0 ],
        [ 128, 128, 128, 1.0 ]
      ]
    }];

    var backgroundA = createBackground( gradDataA ),
        backgroundB = createBackground( gradDataB );

    drawDiff( context, backgroundA, backgroundA );
    var diff = calculateDiff( context );
    if ( diff !== 0 ) {
      console.log( 'Diff: ' + diff + ' should be 0.' );
    }

    drawDiff( context, backgroundA, backgroundB );
    diff = calculateDiff( context );
    if ( diff === 0 ) {
      console.log( diff + ' should be > 0.');
    }
  }) ();

  // Test percentages.
  (function() {
    var el = document.querySelector( '.percent' );

    var gradientCSS = el.querySelector( '.gradient-css' );

    var data = [
      {
        angle: '45deg',
        colorStops: [
          [ 0, 0, 0, 1.0 ],
          [ 255, 255, 255, 1.0, '50%' ],
          [ 0, 0, 0, 1.0 ],
          [ 255, 0, 0, 1.0 ]
        ]
      }
    ];

    var background = createBackground( data );
    gradientCSS.style.backgroundImage = background.css();
  }) ();
}) ( window, document );
