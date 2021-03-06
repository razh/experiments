/*globals PI2, Background, LinearGradient, ColorStop, RGBColor, RAD_TO_DEG, DEG_TO_RAD*/
(function() {
  'use strict';

  var HALF_PI = 0.5 * Math.PI;

  function normalizeAngle( angle ) {
    angle = angle % PI2;
    return angle >= 0 ? angle : angle + PI2;
  }

  function quadrantOf( angle ) {
    if ( angle < HALF_PI) { return 0; }
    if ( angle < Math.PI ) { return 1; }
    if ( angle < Math.PI + HALF_PI ) { return 2; }
    return 3;
  }

  /**
   * Percent or pixels.
   *
   * These regexps are very liberal in the values they accept. For example, the
   * following values are accepted:
   *
   *  abc10% -> 10%
   *  abc100px -> 100px
   */
  var percentRegex = /(\d+)(\%)/,
      pixelRegex   = /(\d+)(px)/;

  function unitsOf( string ) {
    if ( percentRegex.test( string ) ) {
      return '%';
    }

    if ( pixelRegex.test( string ) ) {
      return 'px';
    }

    return null;
  }

  var mouse = {
    x: 0,
    y: 0
  };

  var editors = [];

  function Editor( options ) {
    options = options || {};

    this.el = document.querySelector( options.el );

    this.canvas = this.el.querySelector( 'canvas' );
    this.ctx    = this.canvas.getContext( '2d' );

    var rect = this.el.getBoundingClientRect();

    this.canvas.width  = rect.width;
    this.canvas.height = rect.height;

    this.x = rect.left + 0.5 * rect.width;
    this.y = rect.top  + 0.5 * rect.height;

    this.gradientAngle = 0;

    this.gradient = new LinearGradient();
    this.gradient.angle = this.gradientAngle + 'deg';
  }

  Editor.prototype.update = function() {
    var el       = this.el,
        gradient = this.gradient;

    var dx = mouse.x - this.x,
        dy = mouse.y - this.y;

    this.gradientAngle = Math.round( normalizeAngle( Math.atan2( dy, dx ) ) * RAD_TO_DEG ) % 360;
    gradient.angle = this.gradientAngle + 'deg';
    el.style.background = gradient.css();

    // Clean-up.
    [].forEach.call( el.querySelectorAll( '.colorstop' ), function( child ) {
      el.removeChild( child );
    });

    var gradientAngle = this.gradientAngle,
        quadrant = quadrantOf( gradientAngle * DEG_TO_RAD ),
        colorStopCount = gradient.colorStops.length - 1;

    gradient.colorStops.forEach(function( colorStop, index ) {
      var colorStopEl = document.createElement( 'div' );
      colorStopEl.className = 'colorstop';
      colorStopEl.id = 'colorstop-' + index;

      var inPercent, inPixels = false;
      var pixels, xPixels, yPixels;
      if ( unitsOf( colorStop.position ) === 'px' ) {
        inPixels = true;

        pixels = parseInt( colorStop.position, 10 );
        xPixels = Math.round( Math.abs( pixels * Math.sin( gradientAngle * DEG_TO_RAD ) ) );
        yPixels = Math.round( Math.abs( pixels * Math.cos( gradientAngle * DEG_TO_RAD ) ) );
      } else {
        inPercent = true;
      }

      var top, left;
      // TODO: Clean this stuff up!
      // This only handles percentages and pixels right now.
      if ( quadrant === 0 || quadrant === 1 ) {
        left = ( index / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          left = colorStop.position;
          if ( inPixels ) {
            left = xPixels + 'px';
          }
        }
      }

      if ( quadrant === 1 || quadrant === 2 ) {
        top = ( index / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          top = colorStop.position;
          if ( inPixels ) {
            top = yPixels + 'px';
          }
        }
      }

      if ( quadrant === 0 || quadrant === 3 ) {
        top = ( ( colorStopCount - index ) / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          top = ( 100 - parseInt( colorStop.position, 10 ) ) + '%';
          if ( inPixels ) {
            top = 'calc(100% - ' + yPixels + 'px)';
          }
        }
      }

      if ( quadrant === 2 || quadrant === 3 ) {
        left = ( ( colorStopCount - index ) / colorStopCount ) * 100 + '%';

        if ( colorStop.position ) {
          left = ( 100 - parseInt( colorStop.position, 10 ) ) + '%';
          if ( inPixels ) {
            left = 'calc(100% - ' + xPixels + 'px)';
          }
        }
      }

      if ( gradient.angle === '0deg' || gradient.angle === '180deg' ) {
        left = '50%';
      }

      if ( gradient.angle === '90deg' || gradient.angle === '270deg' ) {
        top = '50%';
      }

      colorStopEl.style.background = colorStop.css();
      colorStopEl.style.top = top;
      colorStopEl.style.left = left;
      colorStopEl.style.transform = 'rotateZ(' + gradient.angle + ')';

      el.appendChild( colorStopEl );
    });

    this.drawCanvas();
  };

  Editor.prototype.drawCanvas = function() {
    var canvas = this.canvas,
        ctx    = this.ctx;

    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.font = '16pt Helvetica, Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText( this.gradientAngle, 20, canvas.height - 20 );
  };


  function Output( options ) {
    options = options || {};

    this.el = document.querySelector( options.el );
    this.background = new Background();
  }

  Output.prototype.update = function() {
    this.el.style.background = this.background.css();
  };


  var editor0 = new Editor({
    el: '#gradient-canvas-0'
  });

  editors.push( editor0 );

  editor0.gradient.colorStops.push( new ColorStop( new RGBColor( 255,   0, 128 ) ) );
  editor0.gradient.colorStops.push( new ColorStop( new RGBColor(   0, 255, 255 ), '40%' ) );
  editor0.gradient.colorStops.push( new ColorStop( new RGBColor( 255, 128, 255 ), '80%' ) );
  editor0.gradient.colorStops.push( new ColorStop( new RGBColor(   0,   0, 255 ) ) );

  editor0.update();


  var editor1 = new Editor({
    el: '#gradient-canvas-1'
  });

  editors.push( editor1 );

  editor1.gradient.colorStops.push( new ColorStop( new RGBColor(   0,   0, 128 ) ) );
  editor1.gradient.colorStops.push( new ColorStop( new RGBColor( 255, 255, 255 ), '90px' ) );
  editor1.gradient.colorStops.push( new ColorStop( new RGBColor(   0,   0, 255 ) ) );

  editor1.update();

  var output0 = new Output({
    el: '#gradient-output'
  });

  output0.background.gradients.push( editor0.gradient );
  output0.background.gradients.push( editor1.gradient );


  function onMouseMove( event ) {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    editors.forEach(function( editor ) {
      editor.update();
    });

    output0.update();
  }

  window.addEventListener( 'mousemove', onMouseMove );

}) ();
