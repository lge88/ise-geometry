

/*!
 * from simplexn
 * dimension-independent geometric kernel based on simplicial complex
 * Copyright (c) 2011 cvd-lab <cvd-lab@email.com> (https://github.com/cvd-lab/)
 * MIT License
 */


/**
 * Variables.
 */

var cos = Math.cos;
var sin = Math.sin;
var round = Math.round;
var min = Math.min;
var abs = Math.abs;
var pi = Math.PI;
var random = Math.random;
var floor = Math.floor;

/**
 * Library namespace.
 */

/**
 * Library version.
 */

exports.version = '0.1.8';

/**
 * utils namespace
 * @api private
 */

exports._utils = {};

/**
 * _flat
 * Return a flat version of the given array of arrays.
 *
 * @param {Array} arrays
 * @return {Array} array
 * @api private
 */

var _flat =
  exports._utils._flat = function (arrays) {
    var res = [];

    arrays.forEach(function (item) {
      // res = res.concat(item);
      item.forEach( function( i ) { res.push( i ); } );
    });

    return res;
  };

/**
 * _repeat
 * Return an array made by n times value item.
 *
 * @param {Number|Boolean|String} value
 * @param {Number} n
 * @return {Array} array
 * @api private
 */

var _repeat =
  exports._utils._repeat = function (value, n) {
    var res = [];

    while (n--) res.push(value);

    return res;
  };

/**
 * _swap
 * Swap i1 to i2 indexed items in array.
 *
 * @param {Array|BufferArray} array
 * @param {Number} i1
 * @param {Number} i2
 * @api private
 */

var _swap =
  exports._utils._swap = function (array, i1, i2) {
    var tmp = array[i1];
    array[i1] = array[i2];
    array[i2] = tmp;
  };

/**
 * _quickSort
 * Quick sort algorithm.
 *
 * @param {Array|BufferArray} array to sort
 * @api private
 */

var _partition =
  exports._utils._partition = function (array, begin, end, pivot) {
    var piv = array[pivot];
    var store = begin;
    var ix;

    _swap(array, pivot, end - 1);
    for (ix = begin; ix < end - 1; ++ix) {
      if (array[ix] <= piv) {
        _swap(array, store, ix);
        ++store;
      }
    }
    _swap(array, end - 1, store);

    return store;
  };

var _qsort =
  exports._utils._qsort = function (array, begin, end) {
    if (end - 1 > begin) {
      var pivot = begin + floor(random() * (end - begin));

      pivot = _partition(array, begin, end, pivot);

      _qsort(array, begin, pivot);
      _qsort(array, pivot + 1, end);
    }
  };

var _quickSort =
  exports._utils._quickSort = function (array) {
    _qsort(array, 0, array.length);
  };

/**
 * _areEqual
 *
 * @param {Array|Float32Array|Uint32Array} a1
 * @param {Array|Float32Array|Uint32Array} a2
 * @return {Boolean} true if each item of a1 is === to correspond element of a2
 * @api private
 */

var _areEqual =
  exports._utils._areEqual = function (a1, a2) {
    var a1Len = a1.length;
    var a2Len = a2.length;
    var i;

    if (a1Len !== a2Len) {
      return false;
    }

    for (i = 0; i < a1Len; i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }

    return true;
  };

/**
 * _toArray
 *
 * @param {Array|Float32Array|Uint32Array} inArray
 * @return {Array} Array object containing all of the element in inArray
 * @api private
 */

var _toArray =
  exports._utils._toArray = function (inArray) {
    inArray || ( inArray = [] );
    var i;
    var length = inArray.length;
    var outArray = new Array(length);

    for (i = 0; i < length; i += 1) {
      outArray[i] = (inArray[i]);
    }

    return outArray;
  };

/**
 * vector operations namespace
 * @api public
 */

exports.vector = {};

/**
 * add
 *
 * @param {Array|Float32Array|Uint32Array} v1
 * @param {Array|Float32Array|Uint32Array} v2
 * @return {Array|Float32Array|Uint32Array}
 * @api public
 */

var vectorAdd =
  exports.vector.add = function (v1, v2) {
    var rn = v1.length;
    var res = new v1.constructor(rn);
    var i;

    for (var i = 0; i < rn; i += 1) {
      res[i] = v1[i] + v2[i];
    };

    return res;
  };

/**
 * sub
 *
 * @param {Array|Float32Array|Uint32Array} v1
 * @param {Array|Float32Array|Uint32Array} v2
 * @return {Array|Float32Array|Uint32Array}
 * @api public
 */

var vectorSub =
  exports.vector.sub = function (v1, v2) {
    var rn = v1.length;
    var res = new v1.constructor(rn);
    var i;

    for (var i = 0; i < rn; i += 1) {
      res[i] = v1[i] - v2[i];
    };

    return res;
  };

/**
 * mul
 *
 * @param {Array|Float32Array|Uint32Array} v1
 * @param {Array|Float32Array|Uint32Array} v2
 * @return {Array|Float32Array|Uint32Array}
 * @api public
 */

var vectorMul =
  exports.vector.mul = function (v1, v2) {
    var rn = v1.length;
    var res = new v1.constructor(rn);
    var i;

    for (var i = 0; i < rn; i += 1) {
      res[i] = v1[i] * (v2[i] || 1);
    };

    return res;
  };

/**
 * scalarMul
 *
 * @param {Number} scalar
 * @param {Array|Float32Array|Uint32Array} v
 * @return {Array|Float32Array|Uint32Array}
 * @api public
 */

var vectorScalarMul =
  exports.vector.scalarMul = function (scalar, v) {
    var rn = v.length;
    var res = new v.constructor(rn);
    var i;

    for (var i = 0; i < rn; i += 1) {
      res[i] = scalar * v[i];
    };

    return res;
  };

/**
 * scalarDiv
 *
 * @param {Number} scalar
 * @param {Array|Float32Array|Uint32Array} v
 * @return {Array|Float32Array|Uint32Array}
 * @api public
 */

var vectorScalarDiv =
  exports.vector.scalarDiv = function (scalar, v) {
    var rn = v.length;
    var res = new v.constructor(rn);
    var i;

    for (var i = 0; i < rn; i += 1) {
      res[i] = v[i] / scalar;
    };

    return res;
  };

/**
 * average
 *
 * @param {Array} vectors
 * @return {Array|Float32Array|Uint32Array}
 * @api public
 */

var vectorAvg =
  exports.vector.avg = function (vectors) {
    var vectors = vectors || [[]];
    var length = vectors.length;
    var rn = vectors[0].length;
    var res = new vectors[0].constructor(rn);
    var i;

    for (i = 0; i < rn; i += 1) {
      res[i] = 0;
    }

    res = vectors.reduce(vectorAdd, res);
    res = vectorScalarDiv(length, res);

    return res;
  };

/**
 * matrix operations namespace
 * @api public
 */

exports.matrix = {};

/**
 * identity
 *
 * @param {Number} dim
 * @api public
 */

var matrixIdentity =
  exports.matrix.identity = function (dim) {
    var matrix = new Array(dim);
    var i, j;

    for (i = 0; i < dim; i += 1) {
      matrix[i] = new Array(dim);
      for(j = 0; j < dim; j += 1) {
        matrix[i][j] = (j === i) ? 1 : 0;
      }
    }

    return matrix;
  };
