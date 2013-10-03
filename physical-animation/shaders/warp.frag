/* spec: css */
precision mediump float;

varying vec4 v_color;

void main() {
  css_ColorMatrix = mat4(1.0, 0.0, 0.0, 0.0,
                         0.0, 1.0, 0.0, 0.0,
                         0.0, 0.0, 1.0, 0.0,
                         0.0, 0.0, 0.0, 1.0);

  css_MixColor = v_color;
}
