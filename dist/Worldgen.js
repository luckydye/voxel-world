// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../lib/perlin.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */
var _default = function Noise() {
  var module = function Noise() {
    _classCallCheck(this, Noise);
  };

  function Grad(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  Grad.prototype.dot2 = function (x, y) {
    return this.x * x + this.y * y;
  };

  Grad.prototype.dot3 = function (x, y, z) {
    return this.x * x + this.y * y + this.z * z;
  };

  var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
  var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180]; // To remove the need for index wrapping, double the permutation table length

  var perm = new Array(512);
  var gradP = new Array(512); // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.

  module.seed = function (seed) {
    if (seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);

    if (seed < 256) {
      seed |= seed << 8;
    }

    for (var i = 0; i < 256; i++) {
      var v;

      if (i & 1) {
        v = p[i] ^ seed & 255;
      } else {
        v = p[i] ^ seed >> 8 & 255;
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);
  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/
  // Skewing and unskewing factors for 2, 3, and 4 dimensions

  var F2 = 0.5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6; // 2D simplex noise

  module.simplex2 = function (xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in

    var s = (xin + yin) * F2; // Hairy factor for 2D

    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.

    var y0 = yin - j + t; // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.

    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords

    if (x0 > y0) {
      // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1 = 1;
      j1 = 0;
    } else {
      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1 = 0;
      j1 = 1;
    } // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6


    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords

    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords

    var y2 = y0 - 1 + 2 * G2; // Work out the hashed gradient indices of the three simplex corners

    i &= 255;
    j &= 255;
    var gi0 = gradP[i + perm[j]];
    var gi1 = gradP[i + i1 + perm[j + j1]];
    var gi2 = gradP[i + 1 + perm[j + 1]]; // Calculate the contribution from the three corners

    var t0 = 0.5 - x0 * x0 - y0 * y0;

    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
    }

    var t1 = 0.5 - x1 * x1 - y1 * y1;

    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }

    var t2 = 0.5 - x2 * x2 - y2 * y2;

    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    } // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].


    return 70 * (n0 + n1 + n2);
  }; // 3D simplex noise


  module.simplex3 = function (xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in

    var s = (xin + yin + zin) * F3; // Hairy factor for 2D

    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.

    var y0 = yin - j + t;
    var z0 = zin - k + t; // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.

    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords

    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    } // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.


    var x1 = x0 - i1 + G3; // Offsets for second corner

    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner

    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;
    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner

    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3; // Work out the hashed gradient indices of the four simplex corners

    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i + perm[j + perm[k]]];
    var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
    var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
    var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]]; // Calculate the contribution from the four corners

    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;

    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
    }

    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;

    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }

    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;

    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }

    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;

    if (t3 < 0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    } // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].


    return 32 * (n0 + n1 + n2 + n3);
  }; // ##### Perlin noise stuff


  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return (1 - t) * a + t * b;
  } // 2D Perlin Noise


  module.perlin2 = function (x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
        Y = Math.floor(y); // Get relative xy coordinates of point within that cell

    x = x - X;
    y = y - Y; // Wrap the integer cells at 255 (smaller integer period can be introduced here)

    X = X & 255;
    Y = Y & 255; // Calculate noise contributions from each of the four corners

    var n00 = gradP[X + perm[Y]].dot2(x, y);
    var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
    var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
    var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1); // Compute the fade curve value for x

    var u = fade(x); // Interpolate the four results

    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
  }; // 3D Perlin Noise


  module.perlin3 = function (x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
        Y = Math.floor(y),
        Z = Math.floor(z); // Get relative xyz coordinates of point within that cell

    x = x - X;
    y = y - Y;
    z = z - Z; // Wrap the integer cells at 255 (smaller integer period can be introduced here)

    X = X & 255;
    Y = Y & 255;
    Z = Z & 255; // Calculate noise contributions from each of the eight corners

    var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
    var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
    var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
    var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
    var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
    var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
    var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
    var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1); // Compute the fade curve value for x, y, z

    var u = fade(x);
    var v = fade(y);
    var w = fade(z); // Interpolate

    return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v);
  };

  return module;
}();

exports.default = _default;
},{}],"gl/graphics/Texture.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Texture = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Texture =
/*#__PURE__*/
function () {
  _createClass(Texture, [{
    key: "image",
    get: function get() {
      return this.img;
    },
    set: function set(image) {
      this.img = image;
    }
  }, {
    key: "width",
    get: function get() {
      return this.image.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.image.height;
    }
  }]);

  function Texture(image) {
    _classCallCheck(this, Texture);

    this.gltexture = null; // gets filled in by the renderer

    this.image = image || null;
    this.scale = 16;
    this.animated = false;
    this.animated = image && image.localName === "video" || false;
  }

  return Texture;
}();

exports.Texture = Texture;
},{}],"gl/graphics/Material.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Material = void 0;

var _Texture = require("./Texture.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Material =
/*#__PURE__*/
function () {
  _createClass(Material, null, [{
    key: "create",
    value: function create(name) {
      Material[name] = new Material();
      Material[name].name = name;
      return Material[name];
    }
  }]);

  function Material() {
    _classCallCheck(this, Material);

    this.texture = new _Texture.Texture();
    this.reflectionMap = new _Texture.Texture();
    this.diffuseColor = [1, 1, 1];
    this.transparency = 0;
    this.reflection = 0;
    this.receiveShadows = true;
    this.castShadows = true;
  }

  return Material;
}();

exports.Material = Material;
},{"./Texture.js":"gl/graphics/Texture.js"}],"gl/Math.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transform = exports.Vec = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vec = function Vec() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  _classCallCheck(this, Vec);

  this.x = x;
  this.y = y;
  this.z = z;
};

exports.Vec = Vec;

var Transform = function Transform() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$position = _ref.position,
      position = _ref$position === void 0 ? new Vec() : _ref$position,
      _ref$rotation = _ref.rotation,
      rotation = _ref$rotation === void 0 ? new Vec() : _ref$rotation,
      _ref$scale = _ref.scale,
      scale = _ref$scale === void 0 ? 1 : _ref$scale;

  _classCallCheck(this, Transform);

  this.position = position;
  this.rotation = rotation;
  this.scale = scale;
};

exports.Transform = Transform;
},{}],"gl/scene/Geometry.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Geometry = void 0;

var _Math = require("../Math.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Geometry =
/*#__PURE__*/
function (_Transform) {
  _inherits(Geometry, _Transform);

  _createClass(Geometry, [{
    key: "buffer",
    get: function get() {
      this._buffer = this._buffer || this.createBuffer();
      return this._buffer;
    }
  }]);

  function Geometry() {
    var _this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Geometry);

    var _args$material = args.material,
        material = _args$material === void 0 ? null : _args$material,
        _args$uv = args.uv,
        uv = _args$uv === void 0 ? [0, 0] : _args$uv;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Geometry).call(this, args));
    _this.mat = material;
    _this.uv = uv;

    _this.onCreate(args);

    return _this;
  }

  _createClass(Geometry, [{
    key: "onCreate",
    value: function onCreate(args) {}
  }, {
    key: "createBuffer",
    value: function createBuffer() {}
  }]);

  return Geometry;
}(_Math.Transform);

exports.Geometry = Geometry;
},{"../Math.js":"gl/Math.js"}],"gl/graphics/VertexBuffer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VertexBuffer = void 0;

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VertexBuffer =
/*#__PURE__*/
function () {
  _createClass(VertexBuffer, [{
    key: "vertsPerElement",
    get: function get() {
      return this.vertecies.length / this.elements;
    }
  }, {
    key: "elements",
    get: function get() {
      var count = 0;

      for (var key in this.attributes) {
        count += this.attributes[key].size;
      }

      return count;
    }
  }]);

  function VertexBuffer(vertArray) {
    _classCallCheck(this, VertexBuffer);

    this.type = "TRIANGLES";
    this.vertecies = new Float32Array(vertArray);
    this.vertArray = vertArray;
    this.attributes = {};
  }

  _createClass(VertexBuffer, [{
    key: "clear",
    value: function clear() {
      this.vertecies = new Float32Array([]);
      this.vertArray = [];
    }
  }], [{
    key: "create",
    value: function create() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _construct(VertexBuffer, args);
    }
  }]);

  return VertexBuffer;
}();

exports.VertexBuffer = VertexBuffer;
},{}],"gl/geo/Cube.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cube = void 0;

var _Geometry2 = require("../scene/Geometry.js");

var _VertexBuffer = require("../graphics/VertexBuffer.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Cube =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Cube, _Geometry);

  _createClass(Cube, [{
    key: "invisible",
    get: function get() {
      return !this.visible.TOP && !this.visible.BOTTOM && !this.visible.LEFT && !this.visible.RIGHT && !this.visible.FRONT && !this.visible.BACK;
    }
  }]);

  function Cube() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Cube);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Cube)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.vertsPerFace = 6;
    _this.visible = {
      TOP: true,
      BOTTOM: true,
      LEFT: true,
      RIGHT: true,
      FRONT: true,
      BACK: true
    };
    return _this;
  }

  _createClass(Cube, [{
    key: "createBuffer",
    value: function createBuffer() {
      var vertArray = [];
      var faces = this.faces;
      var visibleFaces = [];

      for (var key in this.visible) {
        if (this.visible[key]) {
          visibleFaces.push(key);
        }
      }

      visibleFaces.forEach(function (face) {
        vertArray = vertArray.concat(faces[face]);
      });

      var vertxBuffer = _VertexBuffer.VertexBuffer.create(vertArray);

      vertxBuffer.type = "TRIANGLES";
      vertxBuffer.attributes = [{
        size: 3,
        attribute: "aPosition"
      }, {
        size: 2,
        attribute: "aTexCoords"
      }, {
        size: 3,
        attribute: "aNormal"
      }];
      return vertxBuffer;
    }
  }, {
    key: "faces",
    get: function get() {
      var s = 1;
      var w = 10;
      var h = 10;
      var u = this.uv[0];
      var v = this.uv[1];
      var x = 0;
      var y = 0;
      var z = 0;
      return {
        TOP: [s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, s * h + z, 0 + u, 1 + v, 0, 1, 0],
        BOTTOM: [-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, -s * h + z, 1 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0],
        LEFT: [-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, -s * h + y, s * w + z, 1 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1, -s * w + x, s * h + y, s * w + z, 0 + u, 1 + v, 0, 0, 1, -s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1],
        RIGHT: [s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, s * w + x, -s * h + y, -s * w + z, 1 + u, 0 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, -s * w + x, s * h + y, -s * w + z, 0 + u, 1 + v, 0, 0, -1],
        FRONT: [s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0],
        BACK: [-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, -1, 0, 0]
      };
    }
  }]);

  return Cube;
}(_Geometry2.Geometry);

exports.Cube = Cube;
},{"../scene/Geometry.js":"gl/scene/Geometry.js","../graphics/VertexBuffer.js":"gl/graphics/VertexBuffer.js"}],"gl/geo/Voxel.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Voxel = void 0;

var _Cube2 = require("./Cube.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Voxel =
/*#__PURE__*/
function (_Cube) {
  _inherits(Voxel, _Cube);

  function Voxel() {
    _classCallCheck(this, Voxel);

    return _possibleConstructorReturn(this, _getPrototypeOf(Voxel).apply(this, arguments));
  }

  _createClass(Voxel, [{
    key: "faces",
    get: function get() {
      var s = this.scale;
      var w = 10;
      var h = 10;
      var u = this.uv[0];
      var v = this.uv[1];
      var x = this.position.x;
      var y = -this.position.y;
      var z = this.position.z;
      return {
        TOP: [s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, -s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, -s * w + x, s * w + y, s * h + z, 0 + u, 1 + v, 0, 1, 0],
        BOTTOM: [-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, -s * h + z, 1 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, -1, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0],
        LEFT: [-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, -s * h + y, s * w + z, 1 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1, -s * w + x, s * h + y, s * w + z, 0 + u, 1 + v, 0, 0, 1, -s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 1, s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 1],
        RIGHT: [s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, s * w + x, -s * h + y, -s * w + z, 1 + u, 0 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, -1, -s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, -1, -s * w + x, s * h + y, -s * w + z, 0 + u, 1 + v, 0, 0, -1],
        FRONT: [s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 1, 0, 0, s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 1, 0, 0, s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 1, 0, 0],
        BACK: [-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, -1, 0, 0, -s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, -1, 0, 0, -s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, -1, 0, 0]
      };
    }
  }]);

  return Voxel;
}(_Cube2.Cube);

exports.Voxel = Voxel;
},{"./Cube.js":"gl/geo/Cube.js"}],"gl/geo/Group.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Group = void 0;

var _Geometry2 = require("../scene/Geometry.js");

var _VertexBuffer = require("../graphics/VertexBuffer.js");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Group =
/*#__PURE__*/
function (_Geometry) {
  _inherits(Group, _Geometry);

  function Group() {
    _classCallCheck(this, Group);

    return _possibleConstructorReturn(this, _getPrototypeOf(Group).apply(this, arguments));
  }

  _createClass(Group, [{
    key: "createBuffer",
    value: function createBuffer() {
      var vertArray = this.build();

      var vertxBuffer = _VertexBuffer.VertexBuffer.create(vertArray);

      vertxBuffer.type = "TRIANGLES";
      vertxBuffer.attributes = [{
        size: 3,
        attribute: "aPosition"
      }, {
        size: 2,
        attribute: "aTexCoords"
      }, {
        size: 3,
        attribute: "aNormal"
      }];
      return vertxBuffer;
    }
  }, {
    key: "build",
    value: function build() {
      var vertArray = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.objects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var obj = _step.value;
          vertArray.push.apply(vertArray, _toConsumableArray(obj._buffer.vertArray));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return vertArray;
    }
  }, {
    key: "onCreate",
    value: function onCreate(args) {
      args.objects = args.objects || [];
      this.objects = args.objects;
    }
  }, {
    key: "add",
    value: function add(geo) {
      this.objects.push(geo);
    }
  }]);

  return Group;
}(_Geometry2.Geometry);

exports.Group = Group;
},{"../scene/Geometry.js":"gl/scene/Geometry.js","../graphics/VertexBuffer.js":"gl/graphics/VertexBuffer.js"}],"VoxelWorldGenerator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VoxelWorldGenerator = void 0;

var _perlin = _interopRequireDefault(require("../lib/perlin.js"));

var _Material = require("./gl/graphics/Material.js");

var _Voxel = require("./gl/geo/Voxel.js");

var _Math = require("./gl/Math.js");

var _Group = require("./gl/geo/Group.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = function Tile(x, y, size, height) {
  _classCallCheck(this, Tile);

  this.tileData = new Array(size);
  this.height = height;
  this.pos = {
    x: x * size,
    y: y * size
  };
  this.group = new _Group.Group();
  this.group.mat = _Material.Material.WORLD;
  this.group.position.x = this.pos.x * 20;
  this.group.position.z = this.pos.y * 20;

  for (var i = 0; i < this.tileData.length; i++) {
    this.tileData[i] = new Array(this.height);

    for (var j = 0; j < this.tileData[i].length; j++) {
      this.tileData[i][j] = new Array(size);
    }
  }
};

var UV = {
  LOG: [0, 0],
  GRASS: [1, 0],
  LAVA: [2, 0],
  STONE: [3, 0],
  LEAVES: [0, 1],
  DIRT: [1, 1],
  WATER: [2, 1],
  SAND: [3, 1]
};

var VoxelWorldGenerator =
/*#__PURE__*/
function () {
  _createClass(VoxelWorldGenerator, [{
    key: "setSeed",
    value: function setSeed(n) {
      this.seed = n;

      _perlin.default.seed(n);
    }
  }, {
    key: "setOptions",
    value: function setOptions() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$tileSize = _ref.tileSize,
          tileSize = _ref$tileSize === void 0 ? 2 : _ref$tileSize,
          _ref$tileHeight = _ref.tileHeight,
          tileHeight = _ref$tileHeight === void 0 ? 40 : _ref$tileHeight,
          _ref$seed = _ref.seed,
          seed = _ref$seed === void 0 ? 0 : _ref$seed,
          _ref$resolution = _ref.resolution,
          resolution = _ref$resolution === void 0 ? 15 : _ref$resolution,
          _ref$threshold = _ref.threshold,
          threshold = _ref$threshold === void 0 ? 0.2 : _ref$threshold,
          _ref$terrainheight = _ref.terrainheight,
          terrainheight = _ref$terrainheight === void 0 ? 15 : _ref$terrainheight;

      this.tileSize = 32;
      this.worldSize = tileSize;
      this.tileHeight = tileHeight;
      this.resolution = resolution;
      this.threshold = threshold;
      this.terrainheight = terrainheight;
      this.treeDensity = 0.65;
      this.setSeed(seed);
    }
  }]);

  function VoxelWorldGenerator(args) {
    _classCallCheck(this, VoxelWorldGenerator);

    this.setOptions(args);
  }

  _createClass(VoxelWorldGenerator, [{
    key: "regen",
    value: function regen(seed, callback) {
      var _this = this;

      seed = seed || Math.random();
      this.setSeed(seed);
      return new Promise(function (resolve, reject) {
        var size = _this.worldSize;
        callback(_this.buildTile(_this.generateTile(0, 0)));

        for (var x = 0; x < size * 2; x++) {
          for (var y = 0; y < size * 2; y++) {
            if (x != 0 && y != 0) {
              var tile = _this.buildTile(_this.generateTile(x - size, y - size));

              callback(tile);
            }
          }
        }

        resolve();
      });
    }
  }, {
    key: "buildTile",
    value: function buildTile(tile) {
      var tileData = tile.tileData;

      for (var x = 0; x < tileData.length; x++) {
        for (var y = 0; y < tileData[x].length; y++) {
          for (var z = 0; z < tileData[x][y].length; z++) {
            if (tileData[x][y][z]) {
              this.voxel(tile, x, y, z, tile.pos.x, tile.pos.y);
            }
          }
        }
      }

      return tile;
    }
  }, {
    key: "generateTile",
    value: function generateTile(x, y) {
      var tileHeight = this.tileHeight;
      var tileSize = this.tileSize;
      var tile = new Tile(x, y, tileSize, tileHeight);
      var tileData = tile.tileData;
      var res = this.resolution; // generate terrain

      var material = function material(yvalue, x, y, z, value) {
        var mats = [UV.STONE];

        if (tileData[x][y - 1] && tileData[x][y - 1][z] == null) {
          mats = [UV.GRASS];
        }

        var dirtLayer = Math.floor(Math.random() * 2 + 2);

        if (tileData[x][y - 1] && tileData[x][y - 1][z] == UV.GRASS || tileData[x][y - dirtLayer] && tileData[x][y - dirtLayer][z] == UV.GRASS) {
          mats = [UV.DIRT];
        }

        if (y > tileHeight - 2 && !tileData[x][y - 1][z]) {
          mats = [UV.WATER];
        }

        if (y < tileHeight - 1 && y > tileHeight - 3) {
          mats = [UV.SAND];
        }

        return mats[Math.floor(value * mats.length)];
      };

      for (var _x = 0; _x < tileData.length; _x++) {
        for (var _y = 0; _y < tileData[_x].length; _y++) {
          for (var z = 0; z < tileData[_x][_y].length; z++) {
            // gen height map
            var noiseV = _perlin.default.perlin2((_x + tile.pos.x) / res, (z + tile.pos.y) / res) * this.terrainheight;
            var yvalue = tileHeight - noiseV;
            var mat = material(yvalue, _x, _y, z, Math.random());

            if (_y > yvalue - 5.5) {
              tileData[_x][_y][z] = mat;
            } else if (_y > tileHeight - 2) {
              tileData[_x][_y][z] = mat;
            }

            if (_y < tileHeight && _y > 0 && _x < this.tileSize && _x >= 0 && z < this.tileSize && z >= 0) {
              var value = _perlin.default.perlin3((_x + tile.pos.x) / res, _y / res, (z + tile.pos.y) / res);

              if (value > this.threshold) {
                tileData[_x][_y][z] = mat;
              } else if (_y > tileHeight - 2) {
                tileData[_x][_y][z] = mat;
              }
            } else if (_y > tileHeight - 2) {
              tileData[_x][_y][z] = mat;
            }
          }
        }
      } // generate features
      // return tile;


      var treeDensity = this.treeDensity;

      for (var _x2 = 0; _x2 < tileData.length; _x2++) {
        for (var _y2 = 0; _y2 < tileData[_x2].length; _y2++) {
          for (var _z = 0; _z < tileData[_x2][_y2].length; _z++) {
            // decide if destination is valid for a tree
            var treeHeight = Math.floor(Math.random() * 10 + 10);

            if (_x2 + 5 < tileSize && _x2 - 5 > 0 && _y2 > treeHeight && _z + 5 < tileSize && _z - 5 > 0) {
              if (tileData[_x2][_y2 + 1] && tileData[_x2][_y2 - 1] && tileData[_x2][_y2 + 1][_z] && !tileData[_x2][_y2 - 1][_z] && tileData[_x2][_y2 + 1][_z] == UV.GRASS) {
                var _yvalue = _perlin.default.perlin2(_x2 * treeDensity + tile.pos.y, _z * treeDensity + tile.pos.y) + 0.1;

                if (_yvalue < 0.5 && _yvalue > 0.45) {
                  this.makeThing(tileData, _x2, _y2, _z);
                } else if (_yvalue >= treeDensity) {
                  this.makeTree(tileData, _x2, _y2, _z, treeHeight);
                }
              }
            }
          }
        }
      }

      return tile;
    }
  }, {
    key: "makeTree",
    value: function makeTree(tileData, x, y, z, height) {
      var tileHeight = this.tileHeight;
      var width = 5;
      var bevel = 0.2;

      if (y - height < tileHeight) {
        if (tileData[x][y - height] && !tileData[x][y - height][z]) for (var i = 0; i < height; i++) {
          // make log
          if (tileData[x][y - i]) {
            if (i <= height - 1) {
              tileData[x][y - i][z] = UV.LOG;
            }
          } // make crown


          if (i >= 2) {
            var diff = -i * 0.22;

            if (i % 2 == 0) {
              diff -= 2;
            }

            for (var tx = -width; tx <= width; tx++) {
              for (var ty = -width; ty <= width; ty++) {
                if (x - tx != x || y - ty != y || i > height - 2) {
                  var p1 = [x, y];
                  var p2 = [x - tx, y - ty];
                  var a = p1[0] - p2[0];
                  var b = p1[1] - p2[1];
                  var dist = Math.sqrt(a * a + b * b);

                  if (dist <= width + bevel + diff) {
                    tileData[x - tx][y - i][z - ty] = UV.LEAVES;
                  }
                }
              }
            }
          }
        }
      }
    }
  }, {
    key: "makeThing",
    value: function makeThing(tileData, x, y, z) {// tileData[x][y][z] = UV.LAVA;
    }
  }, {
    key: "voxel",
    value: function voxel(tile, x, y, z) {
      var offsetX = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var offsetY = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
      var tileData = tile.tileData;
      var tileSize = this.tileSize;
      var tileHeight = this.tileHeight;
      var cube = new _Voxel.Voxel({
        material: _Material.Material.WORLD,
        uv: tileData[x][y][z],
        position: new _Math.Vec(x * 20 + 10 - tileSize / 2 * 20, y * 20 + 10 - tileHeight * 20 - 0.5, z * 20 + 10 - tileSize / 2 * 20)
      });

      if (y - 1 > 0 && y - 1 < tileHeight && tileData[x][y - 1][z]) {
        cube.visible.TOP = false;
      }

      if (y + 1 > 0 && y + 1 < tileHeight && tileData[x][y + 1][z]) {
        cube.visible.BOTTOM = false;
      }

      if (z - 1 > 0 && z - 1 < tileSize && tileData[x][y][z - 1]) {
        cube.visible.RIGHT = false;
      }

      if (z + 1 > 0 && z + 1 < tileSize && tileData[x][y][z + 1]) {
        cube.visible.LEFT = false;
      }

      if (x - 1 > 0 && x - 1 < tileSize && tileData[x - 1][y][z]) {
        cube.visible.BACK = false;
      }

      if (x + 1 > 0 && x + 1 < tileSize && tileData[x + 1][y][z]) {
        cube.visible.FRONT = false;
      }

      if (!cube.invisible) {
        if (cube.buffer) {
          tile.group.add(cube);
        }
      }
    }
  }]);

  return VoxelWorldGenerator;
}();

exports.VoxelWorldGenerator = VoxelWorldGenerator;
},{"../lib/perlin.js":"../lib/perlin.js","./gl/graphics/Material.js":"gl/graphics/Material.js","./gl/geo/Voxel.js":"gl/geo/Voxel.js","./gl/Math.js":"gl/Math.js","./gl/geo/Group.js":"gl/geo/Group.js"}],"Worldgen.js":[function(require,module,exports) {
"use strict";

var _VoxelWorldGenerator = require("./VoxelWorldGenerator.js");

var worldGen = new _VoxelWorldGenerator.VoxelWorldGenerator();

onmessage = function onmessage(e) {
  switch (e.data.type) {
    case 'regen':
      worldGen.setOptions(e.data.settings);
      worldGen.regen(0, function (tile) {
        self.postMessage({
          type: 'tile',
          tile: tile
        });
      });
      break;
  }
};
},{"./VoxelWorldGenerator.js":"VoxelWorldGenerator.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55513" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","Worldgen.js"], null)