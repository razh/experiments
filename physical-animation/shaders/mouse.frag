/* spec: css */
precision mediump float;

uniform vec2 mouse;

varying vec2 v_texCoord;

void main() {
  float d = distance(v_texCoord, mouse) * 3.0;
  css_ColorMatrix = mat4(d, 0.0, 0.0, 0.0,
                         0.0, d, 0.0, 0.0,
                         0.0, 0.0, d, 0.0,
                         0.0, 0.0, 0.0, d);
}
