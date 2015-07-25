'use strict';

var initTestPoint = require('./test-point.js');

var 
  config = {},

  testPoint;

module.exports = config;

config.clearColor = [1, 1, 1, 1];
config.fovX = Math.PI / 2;
config.ipd = 0.065;
config.height = 1024;
config.far = 100;
config.near = 1;
config.width = 1024;

config.fovY = config.fovX * config.height / config.width;
config.pixLen = 2 / config.width;

// TODO
testPoint = initTestPoint(config.width, config.height, config.far - 1);
config.testPoints = [
  testPoint(-0.79, 0.9, 0),
  testPoint(0.2, 0.99, 1),
  testPoint(0.92, 0.83, 2),
  //testPoint(0, 0, 3),
  testPoint(0.001, 0.001, 3),
  testPoint(0.001, 0.75001, 4),
  //testPoint(-0.5, -0.5, 5),
  testPoint(-0.5001, -0.5001, 5),
  testPoint(-0.98, -0.3, 6),
  testPoint(0.001, -0.49, 7),
  testPoint(0.2, -0.1, 8),
  testPoint(0.6, -0.4, 9),
  testPoint(-0.43, 0.56, 10)
];

// Test the test points.
config.testPoints.forEach(function iteratee(tp)
{
  [config.ipd, -config.ipd].forEach(function iteratee(ipd)
  {
    var points = tp.toWorld(ipd);

    tp.range.forEach(function iteratee(i)
    {
      var 
        wp = Array.prototype.slice.call(points, i * 3, i * 3 + 3),
        sSource = wp[0] / Math.abs(wp[2]),
        sDest = sSource - ipd / Math.abs(wp[2]);

      if (Math.abs(Math.abs(tp.s) - Math.abs(sDest)) > 0.001 || 
          !isFinite(sDest))
        throw new Error('Test point test failed.');
    });
  });
});

console.log(config);