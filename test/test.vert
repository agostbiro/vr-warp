attribute vec3 
  aColor,
  aPos;

uniform mat4 uProjection;

varying vec3 vColor;

void main() 
{
  vColor = aColor;

  gl_PointSize = 1.0;

  gl_Position = uProjection * vec4(aPos, 1.0);
}