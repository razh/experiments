/*jshint strict:false, evil:true*/
/*exported Equation*/
var Equation = (function() {

  function evaluate( string ) {
    var fn;

    try {
      fn = new Function( [ 'x' ],
        'with (Math) {' +
          'return ' + string + ';' +
        '}'
      );

      // Test execution.
      fn(0);
    } catch ( error ) {
      return error;
    }

    return fn;
  }

  return {
    evaluate: evaluate
  };
}) ();
