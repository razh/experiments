(function( window, document, undefined ) {
  'use strict';

  // Canvas.
  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  // AUdio.
  var audioContext,
      analyser;

  var binCount,
      levelBins;

  var level = 0,
      levelsCount = 16;

  var freqByteData,
      timeByteData;

  // Last 256 average normal levels.
  var levelHistory = [];

  var waveData = [],
      levelsData = [];

  var oscillator,
      gain;

  /**
   * Based off of Making Audio Reactive Visuals by Felix Turner.
   * http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/
   */
  function initAudio() {
    audioContext = new window.webkitAudioContext();
    analyser = audioContext.createAnalyser();

    analyser.smoothinTimeConstant = 0.8;
    analyser.fftSize = 1024;
    analyser.connect( audioContext.destination );

    binCount = analyser.frequencyBinCount;
    levelBins = Math.floor( binCount / levelsCount );

    freqByteData = new Uint8Array( binCount );
    timeByteData = new Uint8Array( binCount );

    for ( var i = 0; i < 256; i++ ) {
      levelHistory.push(0);
    }

    // Actual sound genration.
    gain = audioContext.createGainNode();
    gain.gain.value = 0.05;

    oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 440;
    oscillator.type = 0;

    oscillator.connect( gain );
    gain.connect( analyser );

    oscillator.start(0);
    oscillator.stop( 0.2 );

    var osc2 = audioContext.createOscillator();
    osc2.frequency.value = 220;
    osc2.type = 2;

    osc2.connect( gain );
    osc2.start(0);
    osc2.stop( 0.8 );

    var osc3 = audioContext.createOscillator();
    osc3.frequency.value = 261.626;
    osc3.type = 3;

    osc3.connect( gain );
    osc3.start( 0 );
    osc3.stop( 0.9 );
  }


  var running = true;

  var startTime;

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );

    if ( Date.now() - startTime > 1000 )  {
      running = false;
    }

    window.requestAnimationFrame( tick );
  }

  function update() {
    analyser.getByteFrequencyData( freqByteData );
    analyser.getByteTimeDomainData( timeByteData );

    // Normalize waveform data.
    var i;
    for ( i = 0; i < binCount; i++ ) {
      waveData[i] = ( timeByteData[i] - 128 ) / 128;
    }

    var j;
    var sum;
    // Normalize levelsData.
    for ( i = 0; i < levelsCount; i++ ) {
      sum = 0;
      for ( j = 0; j < levelBins; j++ ) {
        sum += freqByteData[ i * levelBins + j ];
      }

      levelsData[i] = sum / ( levelBins * 256 );
    }

    // Average level.
    // sum = 0;
    sum = 0;
    for ( j = 0; j < levelsCount; j++ ) {
      sum += levelsData[j];
    }

    level = sum /levelsCount;

    levelHistory.push( level );
    levelHistory.shift(1);
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    // Draw bar chart.
    ctx.beginPath();

    var barWidth = width / levelsCount;
    var i;
    for ( i = 0; i < levelsCount; i++ ) {
      ctx.rect( i * barWidth, height, barWidth - 10, -levelsData[i] * height );
    }

    ctx.fillStyle = 'black';
    ctx.fill();

    // Draw waveform.
    if ( !binCount ) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo( 0, ( waveData[0] + 1 ) * 0.5 * height );
    for ( i = 1; i < binCount; i++ ) {
      ctx.lineTo( i / binCount * width, ( waveData[i] + 1 ) * 0.5 * height );
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  document.addEventListener( 'keydown', function( event ) {
    // ESC.
    if ( event.which === 27 ) {
      running = false;
      console.log( 'quit' );
    }
  });

  function init() {
    initAudio();

    startTime = Date.now();
    tick();
  }

  init();

}) ( window, document );
