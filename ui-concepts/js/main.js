/*globals $*/
$(function() {
  'use strict';

  var PI2 = 2 * Math.PI;

  var DEG_TO_RAD = Math.PI / 180,
      RAD_TO_DEG = 180 / Math.PI;

  var EPSILON = 1e-3;

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

  var vdCircle = new VerticalDashedCircle({
    x: 300,
    y: 300,
    lineWidth: 1,
    majorLineWidth: 2,
    tickLength: 10,
    majorTickLength: 20,
    radius: 200,
    tickAngle: 10 * DEG_TO_RAD,
    tickSubdivisions: 4
  });

  var $vdCanvas = $( '#dashed-circle' ),
      vdCanvas  = $vdCanvas[0],
      vdContext = vdCanvas.getContext( '2d' );

  vdCanvas.width = $vdCanvas.parent().width();
  vdCanvas.height = $vdCanvas.parent().height();

  var running = true;

  function tick() {
    if ( !running ) {
      return;
    }

    draw( vdContext );
    window.requestAnimationFrame( tick );
  }

  function draw( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    vdCircle.draw( ctx );
  }

  draw( vdContext );

  function onMouseMove( event ) {
    var dx = event.pageX - vdCircle.x,
        dy = event.pageY - vdCircle.y;

    vdCircle.rotation = Math.atan2( dy, dx );
    draw( vdContext );
  }

  $vdCanvas.on({
    mousemove: onMouseMove
  });

  // tick();
});
