(function( window, document, undefined ) {
  'use strict';

  var loginBtn = document.getElementsByClassName( 'login-btn' )[0],
      loginBox = document.getElementsByClassName( 'login-box' )[0];

  var shakeClass = 'shake';

  loginBtn.addEventListener( 'click', function() {
    if ( loginBox.classList.contains( shakeClass ) ) {
      return;
    }

    loginBox.classList.add( shakeClass );

    var style = window.getComputedStyle( loginBox ),
        duration = style.webkitAnimationDuration || style.animationDuration;

    // Convert from seconds to milliseconds.
    duration = parseFloat( duration ) * 1e3;

    setTimeout(function() {
      loginBox.classList.remove( shakeClass );
    }, duration );
  });
}) ( window, document );
