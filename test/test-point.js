'use strict';


var _ = require('underscore');


// Window width and height in pixels.
module.exports = function initTestPoint(width, height, maxZ)
{
  var proto = {};

  // Takes an eye offset and returns world points in the source eye's
  // frame that will be warped to the test point's screen coordinates.
  // The last point should be the result of the warp, because that has the
  // lowest depth.
  proto.toWorld = function toWorld(lambda)
  {
    return new Float32Array(
      _.chain(this.range)
        .map(
          function iteratee(i)
          {
            var
              z = i ? Math.abs(lambda) / (i * 2 / width) : maxZ,
              x = this.s * z + lambda,
              y = this.t * z;

            return [x, y, -z];
          }, 
          this
        )
        .flatten()
        .value()
    );
  };

  // Screen coordinates to warp to and the length of the epipolar line in
  // pixels.
  return function testPoint(s, t, len)
  {
    var p = Object.create(proto);

    p.s = s;
    p.t = t;
    p.len = len;
    p.range = _.range(len + 1);

    p.u = Math.floor(width * (s + 1) / 2);
    p.v = Math.floor(height * (t + 1) / 2);

    p.colors = new Float32Array(
      _.chain(p.range)
        .map(function iteratee(i)
        {
          var c = (len - i) / (len + 1);
            
          return [c, c, c];
        })
        .flatten()
        .value()
    );

    return p;
  };
};