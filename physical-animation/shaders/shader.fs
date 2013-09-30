precision mediump float;

varying vec2 v_meshCoord;
uniform float green;

void main() {
  css_ColorMatrix = mat4(v_meshCoord.x, 0.0, 0.0, 0.0,
                         0.0, green, 0.0, 0.0,
                         0.0, 0.0, 1.0, 0.0,
                         0.0, 0.0, 0.0, 1.0);
}
