/*global requestAnimationFrame, Geometry, Entity*/
(function( window, document, undefined ) {
  'use strict';

  var canvas  = document.querySelector( 'canvas' ),
      context = canvas.getContext( '2d' );

  canvas.width  = 640;
  canvas.height = 480;

  var prevTime = Date.now(),
      currTime;

  var entities = [];

  var config = {
    cols: 16,
    rows: 16
  };

  // Cell center.
  // Scalar fields.
  var discomfortField;
  var potentialField;
  var densityField;
  var heightField;
  // 2D vector field.
  var averageVelocityField;

  // Cell faces.
  // Scalar fields (anisotropic).
  var speedField;
  var costField;
  // 2D vector fields.
  var velocityField;
  var gradientHeightField;
  var gradientPotentialField;

  /**
   * Constructs a two-dimensional array of scalars.
   */
  function createField( rows, cols ) {
    var array = new Array( rows );

    var i, j;
    for ( i = 0; i < rows; i++ ) {
      array[i] = new Array( cols );

      for ( j = 0; j < cols; j++ ) {
        array[i][j] = 0;
      }
    }

    return array;
  }

  /**
   * Constructs a two-dimensional array of 2D vectors.
   */
  function createVectorField( rows, cols ) {
    var array = new Array( rows );

    var i, j;
    for ( i = 0; i < rows; i++ ) {
      array[i] = new Array( cols );

      for ( j = 0; j < cols; j++ ) {
        array[i][j] = [ 0, 0 ];
      }
    }

    return array;
  }

  /**
   * Constructs a two-dimensional array of four-length arrays.
   *
   * Dependent on both position and direction (east, north, west, south).
   */
  function createAnisotropicField( rows, cols ) {
    var array = new Array( rows );

    var i, j;
    for ( i = 0; i < rows; i++ ) {
      array[i] = new Array( cols );

      for ( j = 0; j < cols; j++ ) {
        array[i][j] = [ 0, 0, 0, 0 ];
      }
    }

    return array;
  }

  /**
   * Constructs a two-dimensional array of four 2D vectors.
   *
   * Each vector corresponds to a face direction.
   */
  function createFaceVectorField( rows, cols ) {
    var array = new Array( rows );

    var i, j, k;
    for ( i = 0; i < rows; i++ ) {
      array[i] = new Array( cols );

      for ( j = 0; j < cols; j++ ) {
        array[i][j] = new Array(4);

        // Each face has a 2D vector component.
        for ( k = 0; k < 4; k++ ) {
          array[i][j][k] = [ 0, 0 ];
        }
      }
    }
  }

  function init() {
    var rows = config.rows,
        cols = config.cols;

    // Scalar fields.
    discomfortField = createField( rows, cols );
    potentialField  = createField( rows, cols );
    densityField    = createField( rows, cols );
    heightField     = createField( rows, cols );
    // 2D vector field.
    averageVelocityField = createVectorField( rows, cols );

    // Anisotropic fields
    speedField = createAnisotropicField( rows, cols );
    costField  = createAnisotropicField( rows, cols );

    // 2D vectors stored at faces.
    velocityField          = createFaceVectorField( rows, cols );
    gradientHeightField    = createFaceVectorField( rows, cols );
    gradientPotentialField = createFaceVectorField( rows, cols );

    var entityCount = 60;
    while ( entityCount-- ) {
      entities.push(
        new Entity(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      );
    }
  }

  function update() {
    currTime = Date.now();
    var dt = currTime - prevTime;
    prevTime = currTime;

    // Limit max frame time.
    if ( dt > 1e2 ) {
      dt = 1e2;
    }

    // Milliseconds to seconds.
    dt *= 1e-3;

    entities.forEach(function( entity ) {
      entity.update( dt );
    });
  }

  function draw( ctx ) {
    var width  = ctx.canvas.width,
        height = ctx.canvas.height;

    ctx.clearRect( 0, 0, width, height );

    ctx.save();

    ctx.beginPath();
    drawField( ctx, densityField, width, height, 2 );
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#f98';
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    entities.forEach(function( entity ) {
      ctx.beginPath();
      entity.draw( ctx, 8 );
      ctx.stroke();
    });
  }

  function tick() {
    update();
    draw( context );
    requestAnimationFrame( tick );
  }

  function convertDensityField(
    densityField, averageVelocityField,
    entities,
    density, falloff
  ) {
    var entity;
    // Entity properties.
    var x, y;
    var vx, vy;
    // Cell indices.
    var xi, yi;
    // Distance from entity to cell center.
    var dx, dy;
    // Cell densities.
    var pa, pb, pc, pd;
    for ( var i = 0; i < entities; i++ ) {
      entity = entities[i];
      x = entity.x;
      y = entity.y;
      vx = entity.vx;
      vy = entity.vy;

      // Splat entity.
      // Find closest cell center whose coordinates are both less than entity.
      // Transform to cell center space.
      x -= 0.5;
      y -= 0.5;

      xi = Math.floor( x );
      yi = Math.floor( y );

      dx = x - xi;
      dy = y - yi;

      /*
           x --->
        y  +-------+-------+
        |  |       |       |
        v  |   A   |   B   |
           |       |       |
           +-------+-------+
           |       |       |
           |   D   |   C   |
           |       |       |
           +-------+-------+
       */

      pa = Math.pow( Math.min( 1 - dx, 1 - dy ), falloff );
      pb = Math.pow( Math.min(     dx, 1 - dy ), falloff );
      pc = Math.pow( Math.min(     dx,     dy ), falloff );
      pd = Math.pow( Math.min( 1 - dx,     dy ), falloff );

      densityField[ yi     ][ xi     ] += pa;
      densityField[ yi     ][ xi + 1 ] += pb;
      densityField[ yi + 1 ][ xi + 1 ] += pc;
      densityField[ yi + 1 ][ xi     ] += pd;

      // Add weighted velocity.
      averageVelocityField[ yi     ][ xi     ][0] += vx * pa;
      averageVelocityField[ yi     ][ xi     ][1] += vy * pa;
      averageVelocityField[ yi     ][ xi + 1 ][0] += vx * pb;
      averageVelocityField[ yi     ][ xi + 1 ][1] += vy * pb;
      averageVelocityField[ yi + 1 ][ xi + 1 ][0] += vx * pc;
      averageVelocityField[ yi + 1 ][ xi + 1 ][1] += vy * pc;
      averageVelocityField[ yi + 1 ][ xi     ][0] += vx * pd;
      averageVelocityField[ yi + 1 ][ xi     ][1] += vy * pd;
    }

    // Average weighted velocity.
    var rows = averageVelocityField.length,
        cols = averageVelocityField[0].length;

    var crowdDensity;
    for ( y = 0; y < rows; y++ ) {
      for ( x = 0; x < cols; x++ ) {
        crowdDensity = densityField[y][x];
        if ( crowdDensity ) {
          averageVelocityField[y][x][0] /= crowdDensity;
          averageVelocityField[y][x][1] /= crowdDensity;
        }
      }
    }
  }

  function computeUnitCostField(
    speedField, costField,
    densityField, gradientHeightField, averageVelocityField,
    radius,
    slopeMin, slopeMax,
    speedMin, speedMax,
    densityMin, densityMax
  ) {
    var rows = speedField.length,
        cols = speedField[0].length;

    var deltaSlope = slopeMax - slopeMin;
    var deltaSpeed = speedMax - speedMin;
    var deltaDensity = densityMax - densityMin;

    var x, y, d;
    // x- and y-components for direction.
    var dx, dy;
    var density;
    var gradientHeight;
    var averageVelocity;
    var speed;
    var topographicalSpeed = [ 0, 0 ];
    var flowSpeed = [ 0, 0 ];
    for ( y = 0; y < rows; y++ ) {
      for ( x = 0; x < cols; x++ ) {
        for ( d = 0; d < 4; d++ ) {
          // Determine directional components.
          switch ( d ) {
            // East.
            case 0:
              dx = 1;
              dy = 0;
              break;

            // North.
            case 1:
              dx = 0;
              dy = -1;
              break;

            // West.
            case 2:
              dx = -1;
              dy = 0;
              break;

            // South.
            case 3:
              dx = 0;
              dy = 1;
              break;
          }

          gradientHeight = gradientHeightField[y][x][d];

          topographicalSpeed[0] = speedMax +
            ( ( gradientHeight[0] * dx - slopeMin ) / deltaSlope ) * deltaSpeed;
          topographicalSpeed[1] = speedMax +
            ( ( gradientHeight[1] * dy - slopeMin ) / deltaSlope ) * deltaSpeed;

          // Calculate flow speed at a radius from current position.
          // This evaluates the average velocity for a future position.
          // Otherwise, the entity's previous speed would affect the new speed.
          switch ( d ) {
            // East.
            case 0:
              dx += radius;
              break;

            // North.
            case 1:
              dy -= radius;
              break;

            // West.
            case 2:
              dx -= radius;
              break;

            // South.
            case 3:
              dy += radius;
              break;
          }

          dx = Math.floor( dx );
          dy = Math.floor( dy );

          averageVelocity = averageVelocityField[ dy ][ dx ];
          flowSpeed[0] = averageVelocity[0];
          flowSpeed[1] = averageVelocity[1];

          speed = speedField[y][x];
          // Low density. Equivalent to topographical speed.
          if ( density <= densityMin ) {
            speed[0] = topographicalSpeed[0];
            speed[1] = topographicalSpeed[1];
          }

          // High density. Equivalent to flow speed.
          else if ( density >= densityMax ) {
            speed[0] = flowSpeed[0];
            speed[1] = flowSpeed[1];
          }

          // Medium density. Lerp between topographical and flow speed.
          else {
            density = densityField[ dy ][ dx ];
            speed[0] = topographicalSpeed[0] +
              ( ( density[0] - densityMin ) / deltaDensity ) *
              ( flowSpeed[0] - topographicalSpeed[0] );
            speed[1] = topographicalSpeed[1] +
              ( ( density[1] - densityMin ) / deltaDensity ) *
              ( flowSpeed[1] - topographicalSpeed[1] );
          }
        }
      }
    }
  }

  function drawField( ctx, field, width, height, margin ) {
    margin = margin || 0;

    var rows = field.length,
        cols = field[0].length;

    var colWidth  = width / cols,
        rowHeight = height / rows;

    var x, y;
    for ( y = 0; y < cols; y++ ) {
      for ( x = 0; x < rows; x++ ) {
        ctx.rect(
          x * colWidth + margin, y * rowHeight + margin,
          colWidth - margin, rowHeight - margin
        );
      }
    }
  }

  init();
  draw( context );

}) ( window, document );
