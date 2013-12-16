
var utils = require( '../../utils' );
var matrixIdentity = utils.matrix.identity;
var _repeat = utils._utils._repeat;

var cos = Math.cos;
var sin = Math.sin;
var round = Math.round;
var min = Math.min;
var abs = Math.abs;
var pi = Math.PI;
var random = Math.random;
var floor = Math.floor;

module.exports = exports = function( Complex ) {

  var exports = {};

  exports.Complex = Complex;

  // Geometries:

  exports.simplex = function (d) {
    var d = d !== undefined ? d + 1 : 1;
    var dim = d;
    var points0 = [];
    var points = [];
    var cells = [];

    while (d--) {
      points0.push(0);
      cells.unshift(d);
    }

    points =  matrixIdentity(dim);
    points.unshift(points0);

    return new Complex(points, [cells]);
  }

  /**
   * polyline
   *
   * @param {Array} points
   * @return {simplexn.SimplicialComplex} a simplex
   * @api public
   */

  var polyline =
    exports.polyline = function (points) {
      var points = points || [[]];
      var n = points.length - 1;
      var cells = [];
      var i;

      for (i = 0; i < n; i += 1) {
        cells.push([i, i+1]);
      }

      return (new Complex(points, cells)).merge();
    };

  /**
   * polypoint
   *
   * @param {Array} points
   * @return {simplexn.SimplicialComplex} a simplex
   * @api public
   */

  var polypoint =
    exports.polypoint = function (points) {
      var points = points || [[]];
      var cells = points.map(function (p,i) {
        return [i];
      });

      return (new Complex(points, cells));
    };

  /**
   * simplexGrid
   *
   * @param {Array} quotesList is a list of hlist which must be made by positive numbers
   *                 or by an alternation of positive and negative numbers
   * @return {simplexn.SimplicialComplex} a grid of simplexes
   * @api public
   */

  var simplexGrid =
    exports.grid = function (quotesList) {
      var quotesList = quotesList ? quotesList.slice(0) : [[]];
      var quotesListHead = quotesList.shift();
      var quotesListHead0 = quotesListHead[0];
      var quotesListHead0isNeg = quotesListHead0 <= 0;
      var points = quotesListHead0isNeg ? [] : [[0]];
      var length = quotesList.length;
      var complex = [];
      var simpcomp;
      var quote = 0;
      var indx;

      quotesListHead.forEach(function (height, i) {
        quote += abs(height);
        points.push([quote]);
        if (height > 0) {
          indx = i - (quotesListHead0isNeg);
          complex.push([indx,indx+1]);
        }
      });

      simpcomp = new Complex(points, complex);

      quotesList.forEach(function (quotes) {
        simpcomp.extrude(quotes);
      });

      return simpcomp;
    };

  /**
   * cuboid
   *
   * @param {Array} sideds
   * @return {simplexn.SimplicialComplex} a cuboidal simplicial complex
   * @api public
   */

  exports.cuboid = function (sides) {
    sides = sides.map(function (s) { return [s]; });
    return simplexGrid(sides);
  };

  /**
   * intervals
   *
   * @param {Array} values
   * @return {simplexn.SimplicialComplex} intervals
   * @api public
   */

  var intervals =
    exports.intervals = function (tip, n) {
      var values = [];
      var value = tip/n;

      while (n--) values.push(value);

      return simplexGrid([values]);
    };

  /**
   * domain
   *
   * @param {Array} ends
   * @param {Array} ns
   * @return {simplexn.SimplicialComplex} domain
   * @api public
   */

  var domain =
    exports.domain = function (ends, ns) {
      var ends = ends || [0, 2*Math.PI];
      var ns = ns || [36];
      var length = ends.length;
      var endsn = ends[0];
      var begin = endsn[0];
      var end = endsn[1];
      var domain = intervals(end - begin, ns[0]).translate([0], [begin]);
      var values;
      var value;
      var i;
      var n;

      for (i = 1; i < length; i += 1) {
        endsn = ends[i];
        begin = endsn[0];
        end = endsn[1];
        n = ns[i];
        values = [];
        value = (end - begin)/n;

        while (n--) values.push(value);

        domain = domain.extrude(values).translate([i], [begin]);
      }

      return domain;
    };

  /**
   * cube
   *
   * @param {Number} d
   * @return {simplexn.SimplicialComplex} a dim-dimendional cube
   * @api public
   */

  exports.cube = function (d) {
    var d = d || 1;
    var quotes = [];
    while (d--) quotes.push([1]);
    return simplexGrid(quotes);
  };

  /**
   * circle
   *
   * @param {Number} [radius=1]
   * @param {Number} [n=32]
   * @return {simplexn.SimplicialComplex} a circle
   * @api public
   */

  exports.circle = function (radius, n) {
    var r = radius || 1;
    var n = n || 32;
    var domain = intervals(2 * pi, n);

    domain
      .map( function (v) {
        return [r * sin(v[0]), r * cos(v[0])];
      } )
      .merge();

    return domain;
  };

  /**
   * disk
   *
   * @param {Number} [radius=1]
   * @param {Number} [n=32]
   * @param {Number} [m=1]
   * @return {simplexn.SimplicialComplex} a disk
   * @api public
   */

  exports.disk = function (radius, n, m) {
    var radius = radius || 1;
    var n = n || 32;
    var m = m || 1;
    var nQuote = 2 * pi / n;
    var mQuote = radius / m;
    var nQuotes = [];
    var mQuotes = [];
    var domain;

    while (n--) nQuotes.push(nQuote);
    while (m--) mQuotes.push(mQuote);

    domain = simplexGrid([nQuotes,mQuotes]);
    domain
      .map(function (coords) {
        var u = coords[0];
        var v = coords[1];
        return [v*sin(u), v*cos(u)];
      } )
      .merge()

    return domain;
  };

  /**
   * cylinderSurface
   * Produces a cylindrical surface of radius r and heigth h.
   *
   * @param {Number} [r=1]
   * @param {Number} [h=1]
   * @param {Number} [n=16]
   * @param {Number} [m=2]
   * @return {simplexn.SimplicialComplex} a cylindrical surface
   * @api public
   */
  exports.cylinderSurface = function (r, h, n, m) {
    var r = r || 1;
    var h = h || 1;
    var n = n || 16;
    var m = m || 2;
    var domain = simplexGrid([_repeat(2*pi/n, n), _repeat(1./m, m)]);

    domain
      .map(function(v) {
        return [
          r * cos(v[0])
          , r * sin(v[0])
          , h * v[1]
        ];
      } )
      .merge();

    return domain;
  };

  /**
   * cylinderSolid
   * Produces a solid cylindrer with radius r and heigth h.
   *
   * @param {Number} [R=1]
   * @param {Number} [r=0]
   * @param {Number} [h=1]
   * @param {Number} [n=16]
   * @param {Number} [m=1]
   * @param {Number} [p=1]
   * @return {simplexn.SimplicialComplex} a cylinder
   * @api public
   */

  var cilinderSolid =
    exports.cylinderSolid = function (R, r, h, n, m, p) {
      var R = R || 1.;
      var r = r || 0.;
      var h = h || 1.;
      var n = n || 16;
      var m = m || 1;
      var p = p || 1;
      var domain = simplexGrid([_repeat(2*pi/n, n), _repeat((R-r)/m, m), _repeat(h/p, p)]);

      domain
        .translate([1],[r])
        .map(function(v) {
          return [
            v[1] * sin(v[0])
            , v[1] * cos(v[0])
            , v[2]
          ];
        } )
        .merge()

      return domain;
    };

  /**
   * torusSurface
   *
   * produces a toroidal surface of radiuses r,R
   * approximated with n x m x 2 triangles
   *
   * @param {Number} [r=1] r
   * @param {Number} [R=3] R
   * @param {Number} [n=12] n
   * @param {Number} [m=8] m
   * @return {simplexn.SimplicialComplex} torus surface
   * @api public
   */

  var torusSurface =
    exports.torusSurface = function (r, R, n, m) {
      var r = r || 0.5;
      var R = R || 1.5;
      var n = n || 12;
      var m = m || 8;
      var domain = simplexGrid( [ _repeat(2*pi/n, n), _repeat(2*pi/m, m) ] );

      domain
        .map(function (v) {
          return [
            (R + r * cos(v[1])) * cos(v[0])
            , (R + r * cos(v[1])) * sin(v[0])
            , r * sin(v[1])
          ];
        } )
        .merge()

      return domain;
    };

  /**
   * torusSolid
   *
   * produces a toroidal surface of radiuses r,R
   * approximated with n x m x 2 triangles
   *
   * @param {Number} [r=1] r
   * @param {Number} [R=3] r
   * @param {Number} [n=12] n
   * @param {Number} [m=8] m
   * @param {Number} [p=8] p
   * @return {simplexn.SimplicialComplex} torus solid
   * @api public
   */

  var torusSolid =
    exports.torusSolid = function (r, R, n, m, p) {
      var r = r || 1;
      var R = R || 3;
      var n = n || 12;
      var m = m || 8;
      var p = p || 2;
      var domain = simplexGrid([ _repeat(2*pi/n, n), _repeat(2*pi/m, m), _repeat(1/pi, p)]);

      domain
        .map(function (v) {
          return [
            (R + r * v[2] * cos(v[0])) * cos(v[1])
            , (R + r * v[2] * cos(v[0])) * -sin(v[1])
            , r * v[2] * sin(v[0])
          ];
        } )
        .merge()

      return domain;
    };

  /**
   * triangleStrip
   *
   * @param {Array} points
   * @return {simplexn.SimplicialComplex} triangle strip
   * @api public
   */

  var triangleStrip =
    exports.triangleStrip = function (points) {
      var n = points.length;
      var cells = [];
      var i;

      for (i = 2; i < n; i += 1) {
        if (cells.length & 1) {
          cells.push([i-1, i-2, i-0]);
        }
        else {
          cells.push([i-2, i-1, i-0]);
        }
      }

      return new Complex(points, cells);
    };


  /**
   * triangleFan
   *
   * @param {Array} points
   * @return {simplexn.SimplicialComplex} triangle strip
   * @api public
   */

  var triangleFan =
    exports.triangleFan = function (points) {
      var n = points.length;
      var cells = [];
      var i;

      for (i = 2; i < n; i += 1) {
        cells.push([0, i-1, i]);
      }

      return new Complex(points, cells);
    };

  /**
   * helix
   *
   * @param {Number} [r=1] r
   * @param {Number} [pitch=1] pitch
   * @param {Number} [n=24] n
   * @param {Number} [turns=1] turns
   * @return {simplexn.SimplicialComplex} helix
   * @api public
   */

  var helix =
    exports.helix = function (r, pitch, n, turns) {
      var r = r || 1;
      var pitch = pitch || 1;
      var n = n || 24;
      var turns = turns || 8;
      var domain = intervals(2*pi*turns, n*turns);

      domain
        .map(function (v) {
          return [
            r * sin(v[0])
            , r * cos(v[0])
            , pitch / (2*pi) * v[0]
          ];
        } )
        .merge()

      return domain;
    };

  /**
   * triangleDomain
   *
   * @param {n} subdivisions
   * @param {Array} points
   * @return {simplexn.SimplicialComplex} triangleDomain
   * @api public
   */

  var triangleDomain =
    exports.triangleDomain = function (n, points) {

      var pa = points[0];
      var pb = points[1];
      var pc = points[2];

      var net = [];
      var cells = [];

      var x;
      var y;

      for (i = 0; i <= n; i += 1) {net.push([pa[0] + i * (pb[0] - pa[0]) / n, pa[1] + i * (pb[1] - pa[1]) / n, pa[2] + i * (pb[2] - pa[2]) / n]);};

      for  (y = 1; y <= n; y += 1) {
        var r0 = (y - 1) * (n + 2) - (y - 1) * y / 2;
        var r1 = y * (n + 2) - y * (y + 1) / 2;
        for (x = 0; x <= n - y; x += 1) {
          var c0 = r0 + x;
          var c1 = r1 + x;
          net.push([pa[0] + x * (pb[0] - pa[0]) / n + y * (pc[0] - pa[0]) / n, pa[1] + x * (pb[1] - pa[1]) / n + y * (pc[1] - pa[1]) / n, pa[2] + x * (pb[2] - pa[2]) / n + y * (pc[2] - pa[2]) / n]);
          if (x > 0) {cells.push([c1, c0, c1 - 1]);};
          cells.push([c1, c0 + 1, c0]);
        };
      };

      return new Complex(net, cells);
    };
  return exports;
};
