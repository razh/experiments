(function( window, document, undefined ) {
  'use strict';

  var element = document.getElementsByClassName( 'mouse-test' )[0];

  var vertShader    = './shaders/mouse.vert',
      fragShader    = './shaders/mouse.frag',
      blendMode     = 'multiply',
      compositeMode = 'source-atop';

  var cols = 16,
      rows = 16;

  element.addEventListener( 'mousemove', function( event ) {
    var x = event.pageX - element.offsetLeft,
        y = event.pageY - element.offsetTop;

    var width  = element.clientWidth,
        height = element.clientHeight;

    var mouseX = x / width,
        mouseY = y / height;

    // console.log(
    //   x + ', ' +
    //   y + ', ' +
    //   width + ', ' +
    //   height + ', ' +
    //   mouseX + ', ' +
    //   mouseY
    // );

    element.style.webkitFilter = 'custom(' +
      'url(' + vertShader + ')' +
      'mix(url(' + fragShader + ') ' +
      blendMode + ' ' +
      compositeMode + '), ' +
      cols + ' ' + rows + ', ' +
      'mouse ' +
      mouseX + ' ' +
      mouseY +
    ')';
  });
}) ( window, document );
