/*globals $*/
$(function() {
  'use strict';

  /**
   * WARNING: This is horrible spaghetti code, optimized for development speed,
   * rather than extensibility, readability, and debugging. Sorry.
   */

  var PI2 = 2 * Math.PI;

  var DEG_TO_RAD = Math.PI / 180,
      RAD_TO_DEG = 180 / Math.PI;

  var EPSILON = 1e-3;

  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
  }

  /**
   *  Components for Oblivion-esque UI.
   */

   /**
    * We can convert this to pure CSS.
    */
  function VerticalDashedCircle( options ) {
    this.x = options.x || 0;
    this.y = options.y || 0;

    this.rotation = options.rotation || 0;
    this.radius = options.radius || 0;

    this.tickAngle = options.tickAngle || 0;
    this.tickSubdivisions = options.tickSubdivisions || 0;

    this.tickLength = options.tickLength || 0;
    this.majorTickLength = options.majorTickLength || 0;

    this.startAngle = options.startAngle || 0;
    this.endAngle = typeof options.endAngle !== 'undefined' ? options.endAngle : PI2;
    this.anticlockwise = options.anticlockwise || false;

    this.lineWidth = options.lineWidth || 0;
    this.majorLineWidth = options.majorLineWidth || 0;

    this.segments = [];
    this.majorSegments = [];

    this.initialize();
  }

  VerticalDashedCircle.prototype.initialize = function() {
    var startAngle  = this.startAngle,
        endAngle    = this.endAngle,
        tickAngle   = this.tickAngle;

    var tickSubdivisions = this.tickSubdivisions,
        tickCount = Math.floor( ( endAngle - startAngle ) / tickAngle );

    var innerRadius = this.radius - 0.5 * this.tickLength,
        outerRadius = this.radius + 0.5 * this.tickLength;

    var majorInnerRadius = this.radius - 0.5 * this.majorTickLength,
        majorOuterRadius = this.radius + 0.5 * this.majorTickLength;

    var i;
    var angle, cos, sin;
    var x0, y0, x1, y1;
    var segment;
    // Draw minor ticks.
    for ( i = 0; i < tickCount; i++ ) {
      angle = i * tickAngle + startAngle;
      cos = Math.cos( angle );
      sin = Math.sin( angle );

      if ( i % tickSubdivisions ) {
        x0 = cos * innerRadius;
        y0 = sin * innerRadius;
        x1 = cos * outerRadius;
        y1 = sin * outerRadius;
      } else {
        x0 = cos * majorInnerRadius;
        y0 = sin * majorInnerRadius;
        x1 = cos * majorOuterRadius;
        y1 = sin * majorOuterRadius;
      }

      segment = [
        [ x0, y0 ],
        [ x1, y1 ]
      ];

      if ( i % tickSubdivisions ) {
        this.segments.push( segment );
      } else {
        this.majorSegments.push( segment );
      }
    }
  };

  VerticalDashedCircle.prototype.draw = function( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( this.rotation );

    ctx.shadowColor = 'rgba(0, 128, 255, 1)';
    ctx.shadowBlur = 10;

    // Draw minor ticks.
    ctx.beginPath();

    this.segments.forEach(function( segment ) {
      ctx.moveTo( segment[0][0], segment[0][1] );
      ctx.lineTo( segment[1][0], segment[1][1] );
    });

    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw major ticks.
    ctx.beginPath();
    this.majorSegments.forEach(function( segment ) {
      ctx.moveTo( segment[0][0], segment[0][1] );
      ctx.lineTo( segment[1][0], segment[1][1] );
    });

    ctx.lineWidth = this.majorLineWidth;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.restore();
  };

  /**
   * This uses HTML and CSS rather than Canvas.
   */
  function VerticalDashedCircleCSS( options ) {
    this.el = options.el || null;
    this.$el = $( this.el );

    this.rotation = 0;
    this.radius = options.radius || 0;

    this.startAngle = options.startAngle || 0;
    this.endAngle = typeof options.endAngle !== 'undefined' ? options.endAngle : PI2;
    this.anticlockwise = options.anticlockwise || false;

    this.tickAngle = options.tickAngle || 0;
    this.tickSubdivisions = options.tickSubdivisions || 0;

    this.tickElements = [];

    this.init();
  }

  VerticalDashedCircleCSS.prototype.init = function() {
    var startAngle = this.startAngle,
        tickAngle  = this.tickAngle,
        radius     = this.radius,
        rotation   = this.rotation;

    var tickSubdivisions = this.tickSubdivisions,
        tickCount = Math.floor( ( this.endAngle - startAngle ) / tickAngle );

    var fragment = document.createDocumentFragment();

    var el, textEl;
    var x, y, angle, transform;
    for ( var i = 0; i < tickCount; i++ ) {
      el = document.createElement( 'div' );
      el.classList.add( 'tick' );
      if ( i % tickSubdivisions !== 0 ) {
        el.classList.add( 'minor' );
      }

      angle = i * tickAngle + startAngle + rotation;

      x = round( Math.cos( angle ) * radius, 1 );
      y = round( Math.sin( angle ) * radius, 1 );

      angle = round( angle * RAD_TO_DEG, 1 );

      transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle +  'deg)';
      el.style.webkitTransform = transform;
      el.style.transform = transform;

      el.setAttribute( 'data-index', i );

      textEl = document.createElement( 'div' );
      textEl.classList.add( 'angle' );
      textEl.appendChild( document.createTextNode( angle ) );
      el.appendChild( textEl );

      fragment.appendChild( el );
      this.tickElements.push( el );
    }

    this.$el.append( fragment );
    this.$el.css({
      width: 0,
      height: 0,
      transform: 'translateZ(0)',
      'transform-origin': 'left top',
    });
  };

  VerticalDashedCircleCSS.prototype.update = function() {
    this.$el.css({
      transform: 'rotate(' + round( this.rotation * RAD_TO_DEG, 1 ) + 'deg) translateZ(0)'
    });
  };

  /**
   * Instances.
   */
  var vdCircleCSS = new VerticalDashedCircleCSS({
    el: '#css-dashed-circle',
    tickAngle: 10 * DEG_TO_RAD,
    radius: 200,
    tickSubdivisions: 3
  });

  var $oblvButton = $( '#oblv-button' );

  var vdCircle = new VerticalDashedCircle({
    x: $oblvButton.offset().left + 0.5 * $oblvButton.width() - $oblvButton.parent().offset().left,
    y: $oblvButton.offset().top - $oblvButton.parent().offset().top,
    lineWidth: 0.5,
    majorLineWidth: 2,
    tickLength: 10,
    majorTickLength: 20,
    radius: 200,
    tickAngle: 10 * DEG_TO_RAD,
    tickSubdivisions: 3
  });

  var $vdCanvas = $( '#dashed-circle' ),
      vdCanvas  = $vdCanvas[0],
      vdContext = vdCanvas.getContext( '2d' );

  vdCanvas.width = $vdCanvas.parent().width();
  vdCanvas.height = $vdCanvas.parent().height();

  // The canvas context for the css version of VerticalDashedCircle.
  var $cssCanvas = $( '#css-canvas' ),
      cssCanvas  = $cssCanvas[0],
      cssContext = cssCanvas.getContext( '2d' );

  cssCanvas.width = $cssCanvas.parent().width();
  cssCanvas.height = $cssCanvas.parent().height();

  /**
   * Loop.
   */
  var prevTime = Date.now(),
      currTime,
      running = true;

  function tick() {
    if ( !running ) {
      return;
    }

    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    dt *= 1e-3;

    draw( vdContext );
    vdCircleCSS.rotation += 30 * DEG_TO_RAD * dt;
    vdCircleCSS.update();

    window.requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    vdCircle.draw( ctx );
  }

  function onMouseMove( event ) {
    var dx = event.pageX - vdCircle.x,
        dy = event.pageY - vdCircle.y - $vdCanvas.offset().top;

    vdCircle.rotation = Math.atan2( dy, dx );
    draw( vdContext );

    vdCircleCSS.update();
  }

  function onMouseMoveCSS( event ) {
    var dx = event.pageX - vdCircleCSS.$el.offset().left,
        dy = event.pageY - vdCircleCSS.$el.offset().top;

    vdCircleCSS.rotation = Math.atan2( dy, dx );
    vdCircleCSS.update();
  }

  $vdCanvas.on({
    mousemove: onMouseMove
  });

  $( '.oblivion-css' ).on({
    mousemove: onMouseMoveCSS
  });

  $( window ).on( 'resize', function() {
    cssCanvas.width = $cssCanvas.parent().width();
    cssCanvas.height = $cssCanvas.parent().height();

    initCanvas();
    drawCanvas( cssContext );
  });


  /**
   * Initialization.
   */
  function init() {
    draw( vdContext );
    vdCircleCSS.update();

    initCanvas();
    drawCanvas( cssContext );
  }

  /**
   * Canvas overlay for CSS section.
   */
  var paths = {
    arcGroups: [],
    rectGroups: [],
    segmentGroups: []
  };

  var shapes = {
    arcGroups: [],
    rectGroups: [],
    polyGroups: []
  };

  function initCanvas() {
    var x = vdCircleCSS.$el.offset().left,
        y = vdCircleCSS.$el.offset().top - vdCircleCSS.$el.parent().offset().top;

    initPaths( x, y );
    initShapes( x, y );
  }

  function drawCanvas( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    drawPaths( ctx );
    drawShapes( ctx );
  }

  function initPaths( x, y) {
    paths.arcGroups = [];
    paths.rectGroups = [];
    paths.segmentGroups = [];

    var innerRadius = 150;
    var outerRadius = 250;
    var reticuleRadius = 15;

    var halfTargetHeight = 25;

    paths.arcGroups = paths.arcGroups.concat([
      {
        color: '#6ab',
        lineWidth: 1,
        arcs: [
          // Main circle.
          [ x, y, 200, 0, PI2 ],
          // Outer circle.
          [ x, y, outerRadius, 0, Math.PI ],
          // Inner left.
          [ x, y, innerRadius, 0.75 * Math.PI, 1.25 * Math.PI ],
          // Inner right.
          [ x, y, innerRadius, 1.75 * Math.PI, 2.25 * Math.PI ],
          // Reticule.
          [ x, y, reticuleRadius, 0, PI2 ]
        ]
      },
      {
        color: '#9df',
        lineWidth: 3,
        arcs: [
          [ x, y, innerRadius - 6, 0.75 * Math.PI, Math.PI ],
          [ x, y, innerRadius - 6, 1.75 * Math.PI, 2 * Math.PI ]
        ]
      },
      {
        color: '#dff',
        lineWidth: 5,
        arcs: [
          // Thick inner circle.
          [ x, y, 170, 0, PI2 ]
        ]
      }
    ]);

    paths.rectGroups = paths.rectGroups.concat([
      {
        color: '#dff',
        lineWidth: 1,
        rects: [
        ]
      }
    ]);

    paths.segmentGroups = paths.segmentGroups.concat([
      {
        color: '#dff',
        lineWidth: 1.5,
        segments: [
          // Outer left terminal.
          [
            [ x - outerRadius - 10, y ],
            [ x - outerRadius + 10, y ]
          ],
          // Outer right terminal.
          [
            [ x + outerRadius - 10, y ],
            [ x + outerRadius + 10, y ]
          ],
          /**
           * Target left
           */
          // Horizontal start.
          [
            [ x - 30, y ],
            [ x - 100, y ]
          ],
          // Vertical.
          [
            [ x - 30, y - halfTargetHeight ],
            [ x - 30, y + halfTargetHeight ]
          ],
          // Terminal top.
          [
            [ x - 30, y - halfTargetHeight ],
            [ x - 25, y - halfTargetHeight ]
          ],
          // Terminal bottom.
          [
            [ x - 30, y + halfTargetHeight ],
            [ x - 25, y + halfTargetHeight ]
          ],
          /**
           * Target right
           */
          // Horizontal start.
          [
            [ x + 30, y ],
            [ x + 100, y ]
          ],
          // Vertical.
          [
            [ x + 30, y - halfTargetHeight ],
            [ x + 30, y + halfTargetHeight ]
          ],
          // Terminal top.
          [
            [ x + 30, y - halfTargetHeight ],
            [ x + 25, y - halfTargetHeight ]
          ],
          // Terminal bottom.
          [
            [ x + 30, y + halfTargetHeight ],
            [ x + 25, y + halfTargetHeight ]
          ]
        ]
      }
    ]);
  }

  function drawPaths( ctx ) {
    paths.arcGroups.forEach(function( arcGroup ) {
      ctx.lineWidth = arcGroup.lineWidth;
      ctx.strokeStyle = arcGroup.color;

      arcGroup.arcs.forEach(function( arc ) {
        ctx.beginPath();
        ctx.arc.apply( ctx, arc );
        ctx.stroke();
      });
    });

    paths.segmentGroups.forEach(function( segmentGroup ) {
      ctx.beginPath();

      segmentGroup.segments.forEach(function( segment ) {
        ctx.moveTo( segment[0][0], segment[0][1] );
        ctx.lineTo( segment[1][0], segment[1][1] );
      });

      ctx.lineWidth = segmentGroup.lineWidth;
      ctx.strokeStyle = segmentGroup.color;
      ctx.stroke();
    });

    paths.rectGroups.forEach(function( rectGroup ) {
      ctx.beginPath();

      rectGroup.rects.forEach(function( rect ) {
        ctx.rect.apply( ctx, rect );
      });

      ctx.lineWidth = rectGroup.lineWidth;
      ctx.strokeStyle = rectGroup.color;
      ctx.stroke();
    });
  }


  function initShapes( x, y ) {
    shapes.arcGroups = [];
    shapes.rectGroups = [];
    shapes.polyGroups = [];

    shapes.arcGroups = shapes.arcGroups.concat([
      {
        color: '#dff',
        arcs: [
          [ x, y, 2, 0, PI2 ]
        ]
      }
    ]);

    shapes.rectGroups = shapes.rectGroups.concat([
      {
        color: '#6ab',
        // Grid.
        rects: generateGridPoints({
          x: x - 75,
          y: y + 50,
          width: 50,
          height: 30,
          xSpacing: 10,
          ySpacing: 10,
          args: [ 1, 1 ]
        })
      }
    ]);

    shapes.polyGroups = shapes.polyGroups.concat([
      {
        color: '#f64',
        polys: [
          [
            [ x, y - 28 ],
            [ x - 6, y - 35 ],
            [ x + 6, y - 35 ]
          ]
        ]
      }
    ]);
  }

  function drawShapes( ctx )  {
    shapes.arcGroups.forEach(function( arcGroup ) {
      ctx.beginPath();

      arcGroup.arcs.forEach(function( arc ) {
        ctx.arc.apply( ctx, arc );
      });

      ctx.fillStyle = arcGroup.color;
      ctx.fill();
    });

    shapes.rectGroups.forEach(function( rectGroup ) {
      ctx.beginPath();

      rectGroup.rects.forEach(function( rect ) {
        ctx.rect.apply( ctx, rect );
      });

      ctx.fillStyle = rectGroup.color;
      ctx.fill();
    });

    shapes.polyGroups.forEach(function( polyGroup ) {
      ctx.beginPath();

      polyGroup.polys.forEach(function( poly ) {
        ctx.moveTo( poly[0][0], poly[0][1] );
        for ( var i = 1; i < poly.length; i++ ) {
          ctx.lineTo( poly[i][0], poly[i][1] );
        }
      });

      ctx.fillStyle = polyGroup.color;
      ctx.fill();
    });
  }

  function generateGridPoints( options ) {
    var x = options.x || 0,
        y = options.y || 0,
        width = options.width || 0,
        height = options.height || 0,
        xSpacing = options.xSpacing || 0,
        ySpacing = options.ySpacing || 0,
        args = options.args || [];

    var xCount = width / xSpacing,
        yCount = height / ySpacing;

    var grid = [];

    var i, j;
    for ( i = 0; i < xCount; i++ ) {
      for ( j = 0; j < yCount; j++ ) {
        grid.push( [ x + i * xSpacing, y + j * ySpacing ].concat( args ) );
      }
    }

    return grid;
  }

  init();
  // tick();
});
