precision mediump float;

attribute vec4 a_position;
attribute vec2 a_meshCoord;
uniform mat4 u_projectionMatrix;

const int cols = 4;
const int rows = 4;
const int n = rows - 1;
const int m = cols - 1;

uniform mat4 matrix;
uniform float k[10];

varying vec4 v_color;

void main() {
  vec4 position = a_position;
  float value = k[int(a_meshCoord.x * 10.0)];
  position.y += 0.5 * value;
  v_color = vec4(value, 0.0, 0.0, 1.0);
  // gl_Position = u_projectionMatrix * a_position;
  gl_Position = u_projectionMatrix * position;
}
