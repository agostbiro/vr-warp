'use strict';


var _ = require('underscore');
var config = require('./test-config.js');
var createFbo = require('gl-fbo');
var initWarp = require('../src/warp.js');
var glslify = require('glslify');
var glu = require('./lib/gl-util.js');
var mat4 = require('gl-mat4');


var
  canvas = document.createElement('canvas'),
  gl = canvas.getContext('webgl', {antialias: false}),

  program = gl.createProgram(),
  fs = gl.createShader(gl.FRAGMENT_SHADER),
  vs = gl.createShader(gl.VERTEX_SHADER),
  fboIn = createFbo(gl, [config.width, config.height]),
  fboOut = createFbo(gl, [config.width, config.height]),
  warp = initWarp(gl),

  pass = true,
  pixel = new Uint8Array(4),
  range = _.range(config.width),
  warpRes = new Uint8Array(config.width * config.height * 4),

  aColor,
  aPos,
  ipds,
  projection,
  uProjection;


canvas.width = config.width;
canvas.height = config.height;
canvas.style.width = config.width * 50 + 'px';
canvas.style.height = config.height * 50 + 'px';


glu.setUpShader(gl, program, vs, glslify('./test.vert'));
glu.setUpShader(gl, program, fs, glslify('./test.frag'));

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS))
{
  console.error(gl.getProgramInfoLog (program));
  throw new Error('Program failed to link.');
}


aColor = {
  itemSize: 3,
  target: gl.ARRAY_BUFFER,
  type: gl.FLOAT,
  usage: gl.STATIC_DRAW
};
aPos = _.clone(aColor);

projection = mat4.perspective(
  [],
  config.fovY,
  config.width / config.height,
  config.near,
  config.far
);
uProjection = {
  value: projection,
  setter: 'uniformMatrix4fv'
};
glu.setUniform(gl, program, uProjection, 'uProjection');


gl.clearColor.apply(gl, config.clearColor);
gl.enable(gl.DEPTH_TEST);

// Render and warp test points and see if they were warped to the
// correct position.
[config.ipd, -config.ipd].forEach(function iteratee(ipd)
{
  config.testPoints.forEach(function iteratee(tp, i)
  {
    var 
      index,
      color,
      u, v;

    aColor.value = tp.colors;
    color = Array.prototype.slice.call(tp.colors, tp.colors.length - 3);
    aPos.value = tp.toWorld(ipd);

    glu.setUpAttribute(gl, program, 'aColor', aColor);
    glu.enableAttribute(gl, program, aColor);
    glu.setUpAttribute(gl, program, 'aPos', aPos);
    glu.enableAttribute(gl, program, aPos);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboIn.handle);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, config.width, config.height);
    gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, aPos.numItems);
    gl.disableVertexAttribArray(aColor.index);
    gl.disableVertexAttribArray(aPos.index);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fboOut.handle);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    warp(fboIn, ipd, config.near, config.far, 
         0, 0, config.width, config.height, fboOut);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fboOut.handle);
    gl.readPixels(tp.u, tp.v, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    if (pixel[0] !== color[0])
    {
      gl.readPixels(
        0, 0, config.width, config.height, gl.RGBA, gl.UNSIGNED_BYTE, warpRes
      );
      
      index = Array.prototype.indexOf.call(warpRes, color[0]) / 4;
      v = Math.floor(index / config.width);
      u = index - v * config.width;

      console.error(
        ipd, '|', u, v, '|', tp.u, tp.v, '|', tp.len, '|', tp.s, tp.t
      );
      
      pass = false;
    }
  });
});

document.body.style.background = pass ? 'green' : 'red';