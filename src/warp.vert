precision highp float;


attribute vec4 aPos;
attribute vec2 aTexCoord;

varying float vS;

varying vec2 vTexCo;


void main(void)
{
  vTexCo = aTexCoord;

  vS = aPos.x;

  gl_Position = aPos;
}