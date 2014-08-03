/*global Color*/
/*exported MedianCutQuantizer*/
var MedianCutQuantizer = (function() {
  'use strict';

  function MedianCutQuantizer( pixels, Kmax ) {
    this.imageColors = null;
    this.quantColors = this.findRepresentativeColors( pixels, Kmax );
  }

  MedianCutQuantizer.prototype.countQuantizedColors = function() {
    return this.quantColors.length;
  };

  MedianCutQuantizer.prototype.findRepresentativeColors = function( pixels, Kmax ) {
    var colorHist = new ColorHistogram( pixels );
    var K = colorHist.getNumberOfColors();
    var rCols = null;

    this.imageColors = [];
    var rgb, count;
    for ( var i = 0; i < K; i++ ) {
      rgb = colorHist.getColor(i);
      count = colorHist.getCount(i);
      this.imageColors[i] = new ColorNode( rgb, count );
    }

    var initialBox, colorSet, k, done;
    var nextBox, newBox;
    if ( K <= Kmax ) {
      // The image has fewer colors than Kmax.
      rCols = this.imageColors;
    } else {
      initialBox = new ColorBox( 0, K - 1, 0, this.imageColors );
      colorSet = [ initialBox ];
      k = 1;
      done = false;
      while ( k < Kmax && !done ) {
        nextBox = this.findBoxToSplit( colorSet );
        if ( nextBox ) {
          newBox = nextBox.splitBox( this.imageColors );
          colorSet.push( newBox );
          k = k + 1;
        } else {
          done = true;
        }
      }

      rCols = this.averageColors( colorSet );
    }

    return rCols;
  };

  MedianCutQuantizer.prototype.quantizeImage = function( pixels ) {
    var colorNode;
    for ( var i = 0, il = pixels.length; i < il; i++ ) {
      colorNode = this.findClosestColor( pixels[i] );
      pixels[i] = colorNode.rgb();
    }
  };

  MedianCutQuantizer.prototype.findClosestColor = function( rgb ) {
    var index = this.findClosestColorIndex( rgb );
    return this.quantColors[ index ];
  };

  MedianCutQuantizer.prototype.findClosestColorIndex = function( rgb ) {
    var red = Color.red( rgb );
    var green = Color.green( rgb );
    var blue = Color.blue( rgb );
    var minIndex = 0;
    var minDistance = Number.MAX_VALUE;
    var colorNode;
    var distanceSquared;
    for ( var i = 0, il = this.quantColors.length; i < il; i++ ) {
      colorNode = this.quantColors[i];
      distanceSquared = colorNode.distanceSquared( red, green, blue );
      if ( distanceSquared < minDistance ) {
        minDistance = distanceSquared;
        minIndex = i;
      }
    }

    return minIndex;
  };

  MedianCutQuantizer.prototype.findBoxToSplit = function( colorBoxes ) {
    var boxToSplit = null;
    // From the set of splittable color boxes.
    // Select the one with the minimum level.
    var minLevel = Number.MAX_VALUE;
    var box;
    for ( var i = 0, il = colorBoxes.length; i < il; i++ ) {
      box = colorBoxes[i];
      // box can be split.
      if ( box.colorCount() >= 2 ) {
        if ( box.level < minLevel ) {
          boxToSplit = box;
          minLevel = box.level;
        }
      }
    }

    return boxToSplit;
  };

  MedianCutQuantizer.prototype.averageColors = function( colorBoxes ) {
    var avgColors = [];

    var box;
    for ( var i = 0, il = colorBoxes.length; i < il; i++ ) {
      box = colorBoxes[i];
      avgColors[i] = box.getAverageColor( this.imageColors );
    }

    return avgColors;
  };


  // -------- ColorNode ------------------------------------------------------

  function ColorNode() {
    this.red   = 0;
    this.green = 0;
    this.blue  = 0;
    this.count = 0;

    if ( arguments.length === 2 ) {
      var rgb = arguments[0];
      this.red   = Color.red( rgb );
      this.green = Color.green( rgb );
      this.blue  = Color.blue( rgb );
      this.count = arguments[1];
    }

    if ( arguments.length === 4 ) {
      this.red   = arguments[0];
      this.green = arguments[1];
      this.blue  = arguments[2];
      this.count = arguments[3];
    }

    this.hsv = null;
  }

  ColorNode.prototype.rgb = function() {
    return Color.rgb( this.red, this.green, this.blue );
  };

  ColorNode.prototype.getHsv = function() {
    if ( !this.hsv ) {
      this.hsv = Color.RGBtoHSV( this.red, this.green, this.blue, [] );
    }

    return this.hsv;
  };

  ColorNode.prototype.distanceSquared = function( red, green, blue ) {
    var dr = this.red - red;
    var dg = this.green - green;
    var db = this.blue - blue;
    return dr * dr + dg * dg + db * db;
  };


  // -------- ColorBox -------------------------------------------------------

  function ColorBox( lower, upper, level, imageColors ) {
    // Lower index into imageColors.
    this.lower = lower;
    // Upper index into imageColors.
    this.upper = upper;
    // Split level of this color box.
    this.level = level;

    // Number of pixels represented by this color box.
    this.count = 0;
    // Range of contained colors in red dimension.
    this.rmin = 0;
    this.rmax = 0;
    // Range of contained colors in green dimension.
    this.gmin = 0;
    this.gmax = 0;
    // Range of contained colors in blue dimension.
    this.bmin = 0;
    this.bmax = 0;

    this.trim( imageColors );
  }

  ColorBox.prototype.colorCount = function() {
    return this.upper - this.lower;
  };

  ColorBox.prototype.trim = function( imageColors ) {
    // Recompute the boundaries of this color box.
    this.rmin = 255;
    this.rmax = 0;
    this.gmin = 255;
    this.gmax = 0;
    this.bmin = 255;
    this.bmax = 0;
    this.count = 0;

    var colorNode;
    var r, g, b;
    for ( var i = this.lower; i <= this.upper; i++ ) {
      colorNode = imageColors[i];
      this.count += colorNode.count;
      r = colorNode.red;
      g = colorNode.green;
      b = colorNode.blue;
      if ( r > this.rmax ) {
        this.rmax = r;
      }
      if ( r < this.rmin ) {
        this.rmin = r;
      }
      if ( g > this.gmax ) {
        this.gmax = g;
      }
      if ( g < this.gmin ) {
        this.gmin = g;
      }
      if ( b > this.bmax ) {
        this.bmax = b;
      }
      if ( b < this.bmin ) {
        this.bmin = b;
      }
    }
  };

  // Split this color box at the median point along its longest color
  // dimension.
  ColorBox.prototype.splitBox = function( imageColors ) {
    // This box cannot be split.
    if ( this.colorCount() < 2 ) {
      return null;
    } else {
      // Find longest dimension of this box.
      var dim = this.getLongestColorDimension();

      // Find median along dimension.
      var median = this.findMedian( dim, imageColors );

      // Now split this box at the median and return the resulting new box.
      var nextLevel = this.level + 1;
      var newBox = new ColorBox(
        median + 1,
        this.upper,
        nextLevel,
        imageColors
      );

      this.upper = median;
      this.level = nextLevel;
      this.trim( imageColors );
      return newBox;
    }
  };

  // Find longest dimension of this color box (RED, GREEN, or BLUE).
  ColorBox.prototype.getLongestColorDimension = function() {
    var rLength = this.rmax - this.rmin;
    var gLength = this.gmax - this.gmin;
    var bLength = this.bmax - this.bmix;
    if ( bLength >= rLength && bLength >= gLength ) {
      return ColorDimension.BLUE;
    } else if ( gLength >= rLength && gLength >= bLength ){
      return ColorDimension.GREEM;
    } else {
      return ColorDimension.RED;
    }
  };

  // Find the position of the median in RGB space along the red, green, or blue
  // dimension, respectively.
  ColorBox.prototype.findMedian = function( dim, imageColors ) {
    // Sort color in this box along dimension.
    sortRange( imageColors, this.lower, this.upper + 1, comparator[ dim ] );

    // Find the median point.
    var half = this.count / 2;
    var nPixels, median;
    for ( median = this.lower, nPixels = 0; median < this.upper; median++ ) {
      nPixels += imageColors[ median ].count;
      if ( nPixels >= half ) {
        break;
      }
    }

    return median;
  };

  // Sort an array in the range [lower, upper),
  function sortRange( array, lower, upper, compareFn ) {
    var sorted = array.slice( lower, upper );
    if ( typeof compareFn === 'function' ) {
      sorted.sort( compareFn );
    } else {
      sorted.sort();
    }

    for ( var i = lower, il = array.length; i < il && i < upper; i++ ) {
      array[i] = sorted[ i - lower ];
    }

    return array;
  }

  ColorBox.prototype.getAverageColor = function( imageColors ) {
    var rSum = 0;
    var gSum = 0;
    var bSum = 0;
    var n = 0;
    var ci;
    var count;
    for ( var i = this.lower; i <= this.upper; i++ ) {
      ci = imageColors[i];
      count = ci.count;
      rSum += count * ci.red;
      gSum += count * ci.green;
      bSum += count * ci.blue;
      n += count;
    }

    var avgRed   = Math.round( 0.5 + rSum / n );
    var avgGreen = Math.round( 0.5 + gSum / n );
    var avgBlue  = Math.round( 0.5 + gSum / n );
    return new ColorNode( avgRed, avgGreen, avgBlue, n );
  };


  // -------- Color Dimensions -----------------------------------------------
  var ColorDimension = {
    RED:   0,
    GREEM: 1,
    BLUE:  2
  };

  var comparator = {};

  comparator[ ColorDimension.RED ] = function( a, b ) {
    return a.red - b.red;
  };

  comparator[ ColorDimension.GREEN ] = function( a, b ) {
    return a.green - b.green;
  };

  comparator[ ColorDimension.BLUE ] = function( a, b ) {
    return a.blue - b.blue;
  };

  // Helper function for numeric sort.
  function numeric( a, b ) {
    return a - b;
  }

  // -------- ColorHistogram -------------------------------------------------
  //

  function ColorHistogram( color, count ) {
    if ( arguments.length === 2 ) {
      this.countArray = count;
      this.colorArray = color;
    } else if ( arguments.length === 1 ) {
      var pixelsOrig = arguments[0];
      var N = pixelsOrig.length;
      var pixelsCopy = [];
      var i;
      for ( i = 0; i < N; i++ ) {
        pixelsCopy[i] = pixelsOrig[i];
      }

      pixelsCopy.sort( numeric );

      // Tabulate and count unique colors.
      this.colorArray = [];
      this.countArray = [];
      // Current color index.
      var k = -1;
      var curColor = -1;
      for ( i = 0; i < pixelsCopy.length; i++ ) {
        // New color.
        if ( pixelsCopy[i] !== curColor ) {
          k++;
          curColor = pixelsCopy[i];
          this.colorArray[k] = curColor;
          this.countArray[k] = 1;
        } else {
          this.countArray[k]++;
        }
      }
    }
  }

  ColorHistogram.prototype.getNumberOfColors = function() {
    return this.colorArray ? this.colorArray.length : 0;
  };

  ColorHistogram.prototype.getColor = function( index ) {
    return this.colorArray[ index ];
  };

  ColorHistogram.prototype.getCount = function( index ) {
    return this.countArray[ index ];
  };


  MedianCutQuantizer.ColorNode = ColorNode;
  MedianCutQuantizer.ColorBox = ColorBox;
  MedianCutQuantizer.ColorHistogram = ColorHistogram;

  return MedianCutQuantizer;

}) ();
