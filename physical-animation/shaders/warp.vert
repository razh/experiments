/* spec: css */
precision mediump float;

attribute vec4 a_position;
attribute vec2 a_meshCoord;
uniform mat4 u_projectionMatrix;

const int cols = 2;
const int rows = 2;
const int n = rows - 1;
const int m = cols - 1;

const int size = cols * rows;

uniform mat4 matrix;
uniform float k[cols * rows];

varying vec4 v_color;

void main() {
  vec4 position = a_position;
  float value = k[int(a_meshCoord.x * 4.0)];
  position.y += 0.5 * value;
  v_color = vec4(value, 0.0, 0.0, 1.0);
  // gl_Position = u_projectionMatrix * a_position;
  gl_Position = u_projectionMatrix * position;
}
