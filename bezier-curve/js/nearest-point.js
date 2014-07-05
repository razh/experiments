/*jshint camelcase:false*/
/*globals Point*/
/*exported NearestPoint*/
var NearestPoint = (function( Point ) {
  'use strict';

  /*
    Adapted to JavaScript from:

    Solving the Nearest Point-on-Curve Problem
    and
    A Bezier Curve-Based Root-Finder
    by Philip J. Schneider
    from "Graphics Gems", Academic Press, 1990
   */

  // Maximum depth for recursion.
  var MAXDEPTH = 64;

  function ldexp( x, exp ) {
    return x * Math.pow( 2, exp );
  }

  // Flatness control value.
  var EPSILON = ldexp( 1.0, -MAXDEPTH - 1 );
  // Cubic Bezier curve.
  var DEGREE = 3;
  // Degree of eqn to find roots of.
  var W_DEGREE = 5;


  /**
   * NearestPointOnCurve:
   *
   *   Compute the parameter value of the point on a Bezier curve segment
   *   closest to some arbitrary, user-input point.
   *
   *   Return the point on the curve at that parameter value.
   *
   *   P - The user supplied point
   *   V - Control points of cubic Bezier.
   */
  function nearestPointOnCurveParameter( P, V ) {
    // Control points for 5th-degree eqn.
    var w;
    // Possible roots.
    var t_candidate = [];
    // Number of roots found.
    var n_solutions;
    // Parameter value of closest point.
    var t;

    // Convert problem to 5th-degree Bezier form.
    w = convertToBezierForm( P, V );

    // Find all possible roots of 5th-degree equation.
    n_solutions = findRoots( w, W_DEGREE, t_candidate, 0 );

    // Compare distances of P to all candidates, and to t = 0, and t = 1.
    var dist, new_dist;
    var p;
    var v;
    var i;

    // Check distance to beginning of curve, where t = 0.
    dist = P.distanceToSquared( V[0] );
    t = 0.0;

    // Find distances for coordinate points.
    for ( i = 0; i < n_solutions; i++ ) {
      p = bezier( V, DEGREE, t_candidate[i], null, null );
      new_dist = P.distanceToSquared( p );
      if ( new_dist < dist ) {
        dist = new_dist;
        t = t_candidate[i];
      }
    }

    // Finally, look at distance to end point, where t = 1.0.
    new_dist = P.distanceToSquared( V[ DEGREE ] );
    if ( new_dist < dist ) {
      dist = new_dist;
      t = 1.0;
    }

    return t;
  }

  function nearestPointOnCurve( P, V ) {
    var t = nearestPointOnCurveParameter( P, V );
    return bezier( V, DEGREE, t, null, null );
  }


  // Precomputed "z" for cubics.
  var z = [
    [ 1.0, 0.6, 0.3, 0.1 ],
    [ 0.4, 0.6, 0.6, 0.4 ],
    [ 0.1, 0.3, 0.6, 1.0 ]
  ];

  /**
   * ConvertToBezierForm:
   *
   *   Given a point and a Bezier curve, generate a 5th-degree Bezier-format
   *   equation whose solution finds the point on the curve nearest the
   *   user-defined point.
   *
   *   P - The point to find t for.
   *   V - The control points.
   */
  function convertToBezierForm( P, V ) {
    var i, j, k, m, n, ub, lb;
    // Table indices.
    var row, column;
    // V(i)'s - P.
    var c = [];
    // V(i+1) - V(i).
    var d = [];
    // Ctl pts of 5th-degree curve.
    var w;
    // Dot product of c, d.
    var cdTable = [ [], [], [] ];

    // Determine the c's -- these are the vectors created by subtracting
    // point P from each of the control points.
    for ( i = 0; i <= DEGREE; i++ ) {
      c[i] = new Point().subVectors( V[i], P );
    }

    // Determine the d's -- these are vectors created by subtracting
    // each control point from the next.
    for ( i = 0; i <= DEGREE - 1; i++ ) {
      d[i] = new Point().subVectors( V[ i + 1 ], V[i] )
        .multiplyScalar( 3.0 );
    }

    // Create the c, d table -- this is a table of dot products of the
    // c's and d's.
    for ( row = 0; row <= DEGREE - 1; row++ ) {
      for ( column = 0; column <= DEGREE; column++ ) {
        cdTable[ row ][ column ] = d[ row ].dot( c[ column ] );
      }
    }

    // Now, apply the z's to the dot products, on the skew diagonal.
    // Also, set up the x-values, making these "points".
    w = [];
    for ( i = 0; i <= W_DEGREE; i++ ) {
      w[i] = {
        y: 0.0,
        x: i / W_DEGREE
      };
    }

    n = DEGREE;
    m = DEGREE - 1;
    for ( k = 0; k <= n + m; k++ ) {
      lb = Math.max( 0, k - m );
      ub = Math.min( k, n );
      for ( i = lb; i <= ub; i++ ) {
        j = k - i;
        w[ i + j ].y += cdTable[j][i] * z[j][i];
      }
    }

    return w;
  }


  /**
   * FindRoots:
   *
   *   Given a 5th-degree equation in Bernstein-Bezier form, find all of the
   *   roots in the interval [0, 1]. Return the number of roots found.
   *
   *   w - The control points.
   *   degree - The degree of the polynomial.
   *   t - RETURN candidate t-values.
   *   depth - The depth of the recursion.
   */
  function findRoots( w, degree, t, depth ) {
    var i;
    // New left and right control polygons.
    var Left = [], Right = [];
    // Solution count from children.
    var left_count, right_count;
    // Solutions from kids.
    var left_t = [], right_t = [];

    switch ( crossingCount( w, degree ) ) {
      // No solutions here.
      case 0:
        return 0;

      // Unique solution.
      case 1:
        // Stop recursion when the tree is deep enough.
        // If deep enough, return 1 solution at midpoint.
        if ( depth >= MAXDEPTH ) {
          t[0] = ( w[0].x + w[ W_DEGREE ].x ) / 2.0;
          return 1;
        }

        if ( controlPolygonFlatEnough( w, degree ) ) {
          t[0] = computeXIntercept( w, degree );
          return 1;
        }

        break;
    }

    // Otherwise, solve recursively after subdividing central polygon.
    bezier( w, degree, 0.5, Left, Right );
    left_count  = findRoots( Left,  degree, left_t,  depth + 1 );
    right_count = findRoots( Right, degree, right_t, depth + 1 );

    // Gather solutions together.
    for ( i = 0; i < left_count; i++ ) {
      t[i] = left_t[i];
    }

    for ( i = 0; i < right_count; i++ ) {
      t[ i + left_count ] = right_t[i];
    }

    // Send back total number of solutions.
    return left_count + right_count;
  }


  function signOf( x ) {
    return ( x < 0 ) ? -1 : ( x > 0 ) ? 1 : 0;
  }

  /**
   * CrossingCount:
   *
   *   Count the number of times a Bezier control polygon crosses the 0-axis.
   *   This number is >= the number of roots.
   *
   *   V - Control pts of Bezier curve.
   *   degree - Degree of Bezier curve.
   */
  function crossingCount( V, degree ) {
    var i;
    // Number of zero-crossings.
    var n_crossings = 0;
    // Sign of coefficients.
    var sign, old_sign;

    sign = old_sign = signOf( V[0].y );
    for ( i = 1; i <= degree; i++ ) {
      sign = signOf( V[i].y );

      if ( sign !== old_sign ) {
        n_crossings++;
      }

      old_sign = sign;
    }

    return n_crossings;
  }


  /**
   * ControlPolygonFlatEnough:
   *
   *   Check if the control polygon of a Bezier curve is flat enough for
   *   recursive subdivision to bottom out.
   *
   *   V - Control points.
   *   degree - Degree of polynomial.
   *
   *   Corrections by James Walker, jw@jwwalker.com, as follows:

There seem to be errors in the ControlPolygonFlatEnough function in the
Graphics Gems book and the repository (NearestPoint.c). This function
is briefly described on p. 413 of the text, and appears on pages 793-794.
I see two main problems with it.

The idea is to find an upper bound for the error of approximating the x
intercept of the Bezier curve by the x intercept of the line through the
first and last control points. It is claimed on p. 413 that this error is
bounded by half of the difference between the intercepts of the bounding
box. I don't see why that should be true. The line joining the first and
last control points can be on one side of the bounding box, and the actual
curve can be near the opposite side, so the bound should be the difference
of the bounding box intercepts, not half of it.

Second, we come to the implementation. The values distance[i] computed in
the first loop are not actual distances, but squares of distances. I
realize that minimizing or maximizing the squares is equivalent to
minimizing or maximizing the distances.  But when the code claims that
one of the sides of the bounding box has equation
a * x + b * y + c + max_distance_above, where max_distance_above is one of
those squared distances, that makes no sense to me.

I have appended my version of the function. If you apply my code to the
cubic Bezier curve used to test NearestPoint.c,

 static Point2 bezCurve[4] = {    /  A cubic Bezier curve    /
    { 0.0, 0.0 },
    { 1.0, 2.0 },
    { 3.0, 3.0 },
    { 4.0, 2.0 },
    };

my code computes left_intercept = -3.0 and right_intercept = 0.0, which you
can verify by sketching a graph. The original code computes
left_intercept = 0.0 and right_intercept = 0.9.

   */
  function controlPolygonFlatEnough( V, degree ) {
    var i;
    var value;
    var max_distance_above;
    var max_distance_below;
    // Precision of root.
    var error;
    var intercept_1, intercept_2, left_intercept, right_intercept;
    // Coefficients of implicit eqn for line from V[0] - V[deg].
    var a, b, c;
    var det, dInv;
    var a1, b1, c1, a2, b2, c2;

    // Derive the implicit equation for line connecting first
    // and last control points.
    a = V[0].y - V[ degree ].y;
    b = V[ degree ].x - V[0].x;
    c = V[0].x * V[ degree ].y - V[ degree ].x * V[0].y;

    max_distance_above = max_distance_below = 0.0;

    for ( i = 1; i < degree; i++ ) {
      value = a * V[i].x + b * V[i].y + c;

      if ( value > max_distance_above ) {
        max_distance_above = value;
      } else if ( value < max_distance_below ) {
        max_distance_below = value;
      }
    }

    // Implicit equation for zero line.
    a1 = 0.0;
    b1 = 1.0;
    c1 = 0.0;

    // Implicit equation for "above" line.
    a2 = a;
    b2 = b;
    c2 = c - max_distance_above;

    det = a1 * b2 - a2 * b1;
    dInv = 1.0 / det;

    intercept_1 = ( b1 * c2 - b2 * c1 ) * dInv;

    // Implicit equation for "below" line.
    a2 = a;
    b2 = b;
    c2 = c - max_distance_below;

    det = a1 * b2 - a2 * b1;
    dInv = 1.0 / det;

    intercept_2 = ( b1 * c2 - b2 * c1 ) * dInv;

    // Compute intercepts of bounding box.
    left_intercept = Math.min( intercept_1, intercept_2 );
    right_intercept = Math.max( intercept_1, intercept_2 );

    error = right_intercept - left_intercept;

    return error < EPSILON ? 1 : 0;
  }


  /**
   * ComputeXIntercept:
   *
   *   Compute intersection of chord from first control point to last with
   *   0-axis.
   *
   *   V - Control points.
   *   degree - Degree of curve.
   *
   *   NOTE: "T" and "Y" do not have to be computed, and there are many useless
   *   operations in the following (e.g. "0.0 - 0.0").
   */
  function computeXIntercept( V, degree ) {
    var XLK, YLK, XNM, YNM, XMK, YMK;
    var det, detInv;
    var S, T;
    var X, Y;

    XLK = 1.0 - 0.0;
    YLK = 0.0 - 0.0;
    XNM = V[ degree ].x - V[0].x;
    YNM = V[ degree ].y - V[0].y;
    XMK = V[0].x - 0.0;
    YMK = V[0].y - 0.0;

    det = XNM * YLK - YNM * XLK;
    detInv = 1.0 / det;

    S = ( XNM * YMK - YNM * XMK ) * detInv;
    // T = ( XLK * YMK - YLK * XMK ) * detInv;

    X = 0.0 + XLK * S;
    // Y = 0.0 + YLK * S;

    return X;
  }


  /**
   * Bezier:
   *
   *   Evaluate a Bezier curve at a particular parameter value.
   *
   *   Fill in control points for resulting sub-curves if "Left" and "Right"
   *   are non-null.
   *
   *   degree - Degree of bezier curve.
   *   V - Control pts.
   *   t - Parameter value.
   *   Left - RETURN left half ctl pts.
   *   Right - RETURN right half ctl pts.
   */
  function bezier( V, degree, t, Left, Right ) {
    var i, j;
    var Vtemp = [];
    for ( i = 0; i < W_DEGREE + 1; i++ ) {
      Vtemp.push( [] );
    }

    // Copy control points.
    for ( j = 0; j <= degree; j++ ) {
      Vtemp[0][j] = V[j];
    }

    // Triangle computation.
    for ( i = 1; i <= degree; i++ ) {
      for ( j = 0; j <= degree - i; j++ ) {
        Vtemp[i][j] = {
          x: ( 1 - t ) * Vtemp[ i - 1 ][j].x + t * Vtemp[ i - 1 ][ j + 1 ].x,
          y: ( 1 - t ) * Vtemp[ i - 1 ][j].y + t * Vtemp[ i - 1 ][ j + 1 ].y
        };
      }
    }

    if ( Left ) {
      for ( j = 0; j <= degree; j++ ) {
        Left[j] = Vtemp[j][0];
      }
    }

    if ( Right ) {
      for ( j = 0; j <= degree; j++ ) {
        Right[j] = Vtemp[ degree - j ][j];
      }
    }

    return Vtemp[ degree ][0];
  }


  return {
    nearestPointOnCurveParameter: nearestPointOnCurveParameter,
    nearestPointOnCurve: nearestPointOnCurve
  };

}) ( Point );
