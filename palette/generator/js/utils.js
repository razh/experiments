/*global Color*/
/*exported ColorUtils*/
var ColorUtils = (function() {
  'use strict';

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function darken( color, fraction ) {
    return blendColors( Color.BLACK, color, fraction );
  }

  function lighten( color, fraction ) {
    return blendColors( Color.WHITE, color, fraction );
  }

  function blendColors( a, b, t ) {
    return Color.rgb(
      lerp( Color.red(   a ), Color.red(   b ), t ),
      lerp( Color.green( a ), Color.green( b ), t ),
      lerp( Color.blue(  a ), Color.blue(  b ), t )
    );
  }

  function calculateYiqLuma( color ) {
    return Math.round(
      (
        299 * Color.red(   color ) +
        587 * Color.green( color ) +
        114 * Color.blue(  color )
      ) / 1000
    );
  }

  function changeBrightness( color, fraction ) {
    return calculateYiqLuma( color ) >= 128 ?
      darken( color, fraction ) :
      lighten(  color, fraction );
  }

  function calulateContrast( a, b ) {
    return Math.abs( calculateYiqLuma( a ) - calculateYiqLuma( b ) );
  }

  function calculateColorfulness( color ) {
    var hsv = Color.RGBtoHSV( color );
    return hsv[1] * hsv[2];
  }

  return {
    darken: darken,
    lighten: lighten,
    blendColors: blendColors,
    calculateYiqLuma: calculateYiqLuma,
    changeBrightness: changeBrightness,
    calulateContrast: calulateContrast,
    calculateColorfulness: calculateColorfulness
  };

}) ();


/*exported FloatUtils*/
var FloatUtils = (function() {
  'use strict';

  function weightedAverage( values ) {
    // values must be of even length.
    if ( values.length % 2 ) {
      return;
    }

    var sum = 0;
    var sumWeight = 0;

    var value, weight;
    for ( var i = 0, il = values.length; i < il; i += 2 ) {
      value = values[i];
      weight = values[ i + 1 ];

      sum += ( value * weight );
      sumWeight += weight;
    }

    return sum / sumWeight;
  }

  return {
    weightedAverage: weightedAverage
  };

}) ();
