(() => {
  'use strict';

  const audioContext = new AudioContext();
  let source;

  function loadAudioFile(arrayBuffer) {
    source = audioContext.createBufferSource();
    audioContext.decodeAudioData(arrayBuffer, buffer => {
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
      source.addEventListener('ended', source.disconnect);
    });
  }

  document.addEventListener('drop', event => {
    event.stopPropagation();
    event.preventDefault();

    const reader = new FileReader();
    reader.addEventListener('load', fileEvent => loadAudioFile(fileEvent.target.result));
    reader.readAsArrayBuffer(event.dataTransfer.files[0]);
  });

  document.addEventListener('dragover', event => {
    event.stopPropagation();
    event.preventDefault();
  });
})();
