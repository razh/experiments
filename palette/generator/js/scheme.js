/*exported ColorScheme*/
var ColorScheme = (function() {
  'use strict';

  function ColorScheme(
    primaryAccent,
    secondaryAccent,
    tertiaryAccent,
    primaryText,
    secondaryText
  ) {
    this.primaryAccent   = primaryAccent   || 0;
    this.secondaryAccent = secondaryAccent || 0;
    this.tertiaryAccent  = tertiaryAccent  || 0;
    this.primaryText     = primaryText     || 0;
    this.secondaryText   = secondaryText   || 0;
  }

  return ColorScheme;

}) ();
