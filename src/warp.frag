precision highp float;


// For debugging.
const vec4 ONES = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 1.0);
const vec4 WHITE = vec4(1.0, 1.0, 1.0, 1.0);

// Units are world coordinates.
uniform float
  uFar,
  uNear,
  uOffset,
  uPixLen;

uniform sampler2D
  uColorBuffer,
  uDepthBuffer;

varying float vS;

varying vec2 vTexCo;

float
  depth[10],
  halfPixLen,
  offsetInTex,
  reprojX[10],
  searchDir,
  s;

vec2 texCos[10];


vec2 calcTexCo(in float n)
{
  return vTexCo + searchDir * vec2(halfPixLen * n, 0.0);
}

// Convert the z value from the depth buffer to clip coordinates.
// From: http://stackoverflow.com/a/6657284
float getDepth(in vec2 texCo)
{
  float zB, zN;

  zB = texture2D(uDepthBuffer, texCo).x;
  zN = 2.0 * zB - 1.0;
  
  return 2.0 * uNear * uFar / (uFar + uNear - zN * (uFar - uNear));
}

float reproject(in float n, in float depth)
{
  return (vS + searchDir * uPixLen * n) - uOffset / depth;
}

// Accessing textures in a loop is a performance drag, hence the repetition. 
void main(void)
{
  // TODO serve as uniforms?
  halfPixLen = uPixLen / 2.0;
  offsetInTex = uOffset / 2.0;
  searchDir = sign(uOffset);

  // Calculate the texture coordinates for the pixels along the epipolar line.
  texCos[0] = calcTexCo(1.0);
  texCos[1] = calcTexCo(2.0);
  texCos[2] = calcTexCo(3.0);
  texCos[3] = calcTexCo(4.0);
  texCos[4] = calcTexCo(5.0);
  texCos[5] = calcTexCo(6.0);
  texCos[6] = calcTexCo(7.0);
  texCos[7] = calcTexCo(8.0);
  texCos[8] = calcTexCo(9.0);
  texCos[9] = calcTexCo(10.0);

  // Get the z values from the depth buffer.
  depth[0] = getDepth(texCos[0]);
  depth[1] = getDepth(texCos[1]);
  depth[2] = getDepth(texCos[2]);
  depth[3] = getDepth(texCos[3]);
  depth[4] = getDepth(texCos[4]);
  depth[5] = getDepth(texCos[5]);
  depth[6] = getDepth(texCos[6]);
  depth[7] = getDepth(texCos[7]);
  depth[8] = getDepth(texCos[8]);
  depth[9] = getDepth(texCos[9]);

  // Reproject the sample points that lie on the epipolar line.
  reprojX[0] = reproject(1.0, depth[0]);
  reprojX[1] = reproject(2.0, depth[1]);
  reprojX[2] = reproject(3.0, depth[2]);
  reprojX[3] = reproject(4.0, depth[3]);
  reprojX[4] = reproject(5.0, depth[4]);
  reprojX[5] = reproject(6.0, depth[5]);
  reprojX[6] = reproject(7.0, depth[6]);
  reprojX[7] = reproject(8.0, depth[7]);
  reprojX[8] = reproject(9.0, depth[8]);
  reprojX[9] = reproject(10.0, depth[9]);

  s = abs(vS);

  // If a point sampled farther away is reprojected to the current sample point,
  // then it is guaranteed to have lower depth than all the other sample points
  // closer on the epipolar line.
  if (abs(s - abs(reprojX[9])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[9]);

  else if (abs(s - abs(reprojX[8])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[8]);

  else if (abs(s - abs(reprojX[7])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[7]);

  else if (abs(s - abs(reprojX[6])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[6]);

  else if (abs(s - abs(reprojX[5])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[5]);

  else if (abs(s - abs(reprojX[4])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[4]);

  else if (abs(s - abs(reprojX[3])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[3]);

  else if (abs(s - abs(reprojX[2])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[2]);

  else if (abs(s - abs(reprojX[1])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[1]);

  else if (abs(s - abs(reprojX[0])) <= halfPixLen)
    gl_FragColor = texture2D(uColorBuffer, texCos[0]);

  else
    gl_FragColor = texture2D(uColorBuffer, vTexCo);
}