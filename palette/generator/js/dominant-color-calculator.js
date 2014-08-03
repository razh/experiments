/*global Color, ColorScheme, ColorUtils, FloatUtils, MedianCutQuantizer*/
/*exported DominantColorCalculator*/
var DominantColorCalculator = (function() {
  'use strict';

  var NUM_COLORS = 10;

  var PRIMARY_TEXT_MIN_CONTRAST = 135;

  var SECONDARY_MIN_DIFF_HUE_PRIMARY = 120;

  var TERTIARY_MIN_CONTRAST_PRIMARY = 20;
  var TERTIARY_MIN_CONTRAST_SECONDARY = 90;

  function DominantColorCalculator( imageData ) {
    var width = imageData.width;
    var height = imageData.height;

    var data = imageData.data;
    var rgbPixels = new Uint32Array( width * height );
    for ( var i = 0, il = width * height; i < il; i++ ) {
      rgbPixels[i] = Color.rgb(
        data[ 4 * i ],
        data[ 4 * i + 1 ],
        data[ 4 * i + 2 ]
      );
    }

    var mcq = new MedianCutQuantizer( rgbPixels, NUM_COLORS );

    this.palette = mcq.quantColors;
    this.weightedPalette = weight( this.palette );
    this.colorScheme = null;

    this.findColors();
  }

  DominantColorCalculator.prototype.findColors = function() {
    var primaryAccentColor = this.findPrimaryAccentColor();
    var secondaryAccentColor = this.findSecondaryAccentColor( primaryAccentColor );

    var tertiaryAccentColor = this.findTertiaryAccentColor(
      primaryAccentColor.rgb(),
      secondaryAccentColor.rgb()
    );

    var primaryTextColor = this.findPrimaryTextColor( primaryAccentColor.rgb() );
    var secondaryTextColor = this.findSecondaryTextColor( primaryAccentColor.rgb() );

    this.colorScheme = new ColorScheme(
      primaryAccentColor.rgb(),
      secondaryAccentColor.rgb(),
      tertiaryAccentColor,
      primaryTextColor,
      secondaryTextColor
    );
  };

  // Return the first color from our weighted palette.
  DominantColorCalculator.prototype.findPrimaryAccentColor = function() {
    return this.weightedPalette[0];
  };

  // Return the next color in the weighted palette which ideally has enough
  // difference in hue.
  DominantColorCalculator.prototype.findSecondaryAccentColor = function( primary ) {
    var primaryHue = primary.getHsv()[0];

    // Find the first color which has sufficient difference in hue from the
    // primary.
    var candidate;
    var candidateHue;
    for ( var i = 0, il = this.weightedPalette.length; i < il; i++ ) {
      candidate = this.weightedPalette[i];
      candidateHue = candidate.getHsv()[0];

      // Calculate the difference in hue. Return if over the threshold.
      if ( Math.abs( primaryHue - candidateHue ) >+ SECONDARY_MIN_DIFF_HUE_PRIMARY ) {
        return candidate;
      }
    }

    // If we get here, just return the second weighted color.
    return this.weightedPalette[1];
  };

  // Return the first color from our weighted palette which has sufficient
  // contrast from the primary and secondary colors.
  DominantColorCalculator.prototype.findTertiaryAccentColor = function( primary, secondary ) {
    var color;
    for ( var i = 0, il = this.weightedPalette.length; i < il; i++ ) {
      color = this.weightedPalette[i].rgb();
      if ( ColorUtils.calculateContrast( color, primary ) >= TERTIARY_MIN_CONTRAST_PRIMARY &&
           ColorUtils.calculateContrast( color, secondary ) >= TERTIARY_MIN_CONTRAST_SECONDARY ) {
        return color;
      }
    }

    // We couldn't find a color. In that case, use the primary color, modifying
    // its brightness by 45%.
    return ColorUtils.changeBrightness( secondary, 0.45 );
  };

  // Return the first color which has sufficient contrast from the primary
  // colors.
  DominantColorCalculator.prototype.findPrimaryTextColor = function( primary ) {
    // Try and find a color with sufficient contrast from the primary color.
    var color;
    for ( var i = 0, il = this.weightedPalette.length; i < il; i++ ) {
      color = this.weightedPalette[i].rgb();
      if ( ColorUtils.calculateContrast( color, primary ) >= PRIMARY_TEXT_MIN_CONTRAST ) {
        return color;
      }
    }

    // We haven't found a color, so return black or white depending on the
    // primary color's brightness.
    return ColorUtils.calculateYiqLuma( primary ) >= 128 ?
      Color.BLACK : Color.WHITE;
  };

  // Return black or white depending on the primary color's brightness.
  DominantColorCalculator.prototype.findSecondaryTextColor = function( primary ) {
    return ColorUtils.calculateYiqLuma( primary ) >= 128 ?
      Color.BLACK : Color.WHITE;
  };

  function weight( palette ) {
    var copy = palette.slice();
    var maxCount = palette[0].count;

    copy.sort(function( a, b ) {
      var aWeight = calculateWeight( a, maxCount );
      var bWeight = calculateWeight( b, maxCount );

      if ( aWeight < bWeight ) {
        return 1;
      } else if ( aWeight > bWeight ) {
        return -1;
      }

      return 0;
    });

    return copy;
  }

  function calculateWeight( node, maxCount ) {
    return FloatUtils.weightedAverage(
      [
        ColorUtils.calculateColorfulness(
          node.red,
          node.green,
          node.blue
        ),
        2,
        ( node.count / maxCount ),
        1
      ]
    );
  }

  return DominantColorCalculator;

}) ();
