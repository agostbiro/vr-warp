precision mediump float;

// Debugging colors
const vec4 BLACK = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 GREEN = vec4(0.0, 1.0, 0.0, 1.0);
const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);

varying float flag;

varying vec3 vColor;

void main() 
{
  gl_FragColor = vec4(vColor, 1.0);
}
