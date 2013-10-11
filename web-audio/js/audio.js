(function( window, document, undefined ) {
  'use strict';

  // Canvas.
  var canvas  = document.getElementById( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = 'black';

  // Audio.
  var audioContext,
      analyser;

  // Bins for bar chart.
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

  var source,
      delay,
      gain;

  // Delay to sync up audio with visuals.
  var delayTime = 1.0;

  /**
   * Based off of Making Audio Reactive Visuals by Felix Turner.
   * http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/
   */
  function initAudio() {
    audioContext = new window.webkitAudioContext();
    analyser = audioContext.createAnalyser();

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    binCount = analyser.frequencyBinCount;
    levelBins = Math.floor( binCount / levelsCount );

    freqByteData = new Uint8Array( binCount );
    timeByteData = new Uint8Array( binCount );

    for ( var i = 0; i < 256; i++ ) {
      levelHistory.push(0);
    }

    delay = audioContext.createDelayNode( delayTime );
    delay.connect( audioContext.destination );

    gain = audioContext.createGainNode();
    gain.gain.value = 0.5;

    gain.connect( analyser );
    gain.connect( delay );
  }

  var initAudioTest = (function() {
    var called = false;

    return function() {
      if ( called ) {
        return;
      }

      called = true;

      [
        { frequency: 440, type: 0, start: 0, stop: 0.2 },
        { frequency: 220, type: 2, start: 0, stop: 0.8 },
        { frequency: 261.626, type: 3, start: 0, stop: 0.9 },
      ].forEach(function( options ) {
        var osc = audioContext.createOscillator();
        osc.frequency.value = options.frequency;
        osc.type = options.type;

        osc.connect( gain );
        osc.start( options.start );
        osc.stop( options.stop );

        osc.onended = function() {
          osc.disconnect();
        };
      });

      setTimeout(function() {
        called = false;
        running = false;
      }, 1000 );
    };
  }) ();

  function initAudioFile( data ) {
    source = audioContext.createBufferSource();
    audioContext.decodeAudioData( data, function( buffer ) {
      source.buffer = buffer;
      source.connect( gain );
      source.start(0);

      source.onended = function() {
        source.disconnect();
        running = false;
      };
    });
  }


  var running = true;

  function tick() {
    if ( !running ) {
      return;
    }

    update();
    draw( context );
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
    sum = 0;
    for ( j = 0; j < levelsCount; j++ ) {
      sum += levelsData[j];
    }

    level = sum / levelsCount;

    levelHistory.push( level );
    levelHistory.shift(1);
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    var margin = 5;

    ctx.clearRect( 0, 0, width, height );

    // Draw bar chart.
    ctx.beginPath();

    var barWidth = halfWidth / levelsCount,
        translateX = margin + 0.5 * halfWidth;

    var levelHeight;
    var i;
    for ( i = 0; i < levelsCount; i++ ) {
      levelHeight = levelsData[i] * height;

      ctx.rect(
        i * barWidth + translateX,
        halfHeight - 0.5 * levelHeight,
        barWidth - margin,
        levelHeight
      );
    }

    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw waveform.
    if ( !waveData.length ) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo( 0, ( waveData[0] + 1 ) * 0.5 * height );
    for ( i = 1; i < binCount; i++ ) {
      ctx.lineTo( i / binCount * width, ( waveData[i] + 1 ) * halfHeight );
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }

  document.addEventListener( 'keydown', function( event ) {
    // ESC.
    if ( event.which === 27 ) {
      running = false;
      console.log( 'quit' );
    }

    if ( event.which === 'A'.charCodeAt(0) ) {
      initAudioTest();
      tick();
    }
  });

  document.addEventListener( 'drop', function( event ) {
    event.stopPropagation();
    event.preventDefault();

    if ( source ) {
      source.stop(0);
      source.disconnect();
    }

    var reader = new FileReader();
    reader.onload = function( fileEvent ) {
      initAudioFile( fileEvent.target.result );
      running = true;
      tick();
    };

    var files = event.dataTransfer.files;
    reader.readAsArrayBuffer( files[0] );
  });

  // Prevent navigation to audio file.
  document.addEventListener( 'dragover', function( event ) {
    event.stopPropagation();
    event.preventDefault();
  });

  initAudio();

}) ( window, document );
