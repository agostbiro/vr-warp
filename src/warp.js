// Given a frame rendered to a framebuffer created with 'gl-fbo', renders a 
// frame to the default framebuffer from a viewpoint at a horizontal offset and 
// a parallel viewing direction.


'use strict';


var createVAS = require('./lib/view-aligned-square.js');
var glslify = require('glslify');
var glShader = require('gl-shader');


module.exports = function initWarp(gl)
{
  var 
    geometry = createVAS(gl, 'aPos', 'aTexCoord'),
    shader = glShader(
      gl,
      glslify('./warp.vert'),
      glslify('./warp.frag')
    );

  return function warp(sourceFbo, offset, near, far, x, y, w, h, targetFbo)
  {
    if (targetFbo)
      targetFbo.bind();
    else
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(x, y, w, h);

    geometry.bind(shader);

    shader.uniforms.uColorBuffer = sourceFbo.color[0].bind(0);
    shader.uniforms.uDepthBuffer = sourceFbo.depth.bind(1);
    shader.uniforms.uFar = far;
    shader.uniforms.uNear = near;
    shader.uniforms.uOffset = offset;
    shader.uniforms.uPixLen = 2 / sourceFbo.shape[0];

    geometry.draw();

    geometry.unbind();
  };
};