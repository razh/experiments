/* spec: css */
precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_meshCoord;

uniform mat4 u_projectionMatrix;

varying vec2 v_meshCoord;

uniform float time;

void main() {
  vec4 position = a_position;
  position.x += position.y * time;
  position.y += 0.25 * time;
  gl_Position = u_projectionMatrix * position;
  v_meshCoord = a_meshCoord;
}
