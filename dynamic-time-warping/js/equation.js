/*jshint strict:false, evil:true*/
/*exported Equation*/
var Equation = (function() {

  function evaluate( string ) {
    return function( x ) {
      with ( Math ) {
        try {
          return eval( string );
        } catch ( error ) {
          console.log( error );
          return x;
        }
      }
    };
  }

  return {
    evaluate: evaluate
  };
}) ();
