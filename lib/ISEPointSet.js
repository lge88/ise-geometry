var utils = require( './utils' );
var _swap = utils._utils._swap;
var _quickSort = utils._utils._quickSort;
var _flat = utils._utils._flat;
var _areEqual = utils._utils._areEqual;
var _toArray = utils._utils._toArray;
var vectorAdd = utils.vector.add;
var vectorSub = utils.vector.sub;
var vectorMul = utils.vector.mul;
var vectorAvg = utils.vector.avg;

module.exports = exports = PointSet;

function PointSet(points, rn) {
  points = points || [[]];
  if (typeof points === 'number') {
    this.rn = rn;
    points = points * rn;
  } else {
    this.rn  = points[0].length;
    points = _flat(points);
  }
  this.points = new Float32Array(points);
};

PointSet.prototype.__defineGetter__('size', function () {
  return this.points.length / this.rn;
});

PointSet.prototype.clone = function () {
  var clone = new PointSet();
  clone.size = this.size;
  clone.rn = this.rn;
  clone.points = new Float32Array(this.points);
  return clone;
};

PointSet.prototype.toJSON = function () {
  var json = {};

  json.points = _toArray(this.points);
  json.rn = this.rn;

  return json;
};

PointSet.fromJSON = function (json) {
  var json = typeof json === "string" ? JSON.parse(json) : json;
  var rn = json.rn;
  var pointset = new PointSet(json.points.length/rn, rn);

  pointset.points = new Float32Array(json.points);

  return pointset;
};

PointSet.prototype.equals = function (other) {
  if (this.rn !== other.rn || this.size !== other.size) return false;
  for (var i = 0, l = this.points.length; i < l; i += 1) {
    if (this.points[i] !== other.points[i]) {
      return false;
    }
  }
  return true;
};
PointSet.prototype.isEqualTo = PointSet.prototype.equals;

PointSet.prototype.get = function (index) {
  var rn = this.rn;
  var begin = index * rn;
  var end = begin + rn;

  return this.points.subarray(begin, end);
};

PointSet.prototype.set = function (point, index) {
  point = point || 0;
  this.points.set(point, index * this.rn);
  return this;
};

PointSet.prototype.forEach = function (iterator) {
  var points = this.points;
  var length = points.length;
  var rn = this.rn;
  var i, j;

  for (i = j = 0; i < length; i += rn, j += 1) {
    iterator(points.subarray(i, i + rn), j);
  }

  return this;
};

PointSet.prototype.map = function (mapping) {
  var points = this.points;
  var oldRn = this.rn;
  var size = this.size;
  var mappedPoints0 = mapping(_toArray(points.subarray(0,oldRn)), 0);
  var newRn = mappedPoints0.length;
  var newPoints = new Float32Array(size * newRn);
  var i, j;

  newPoints.set(mappedPoints0);

  for (i = oldRn, j = 1; j < size; i += oldRn, j += 1) {
    newPoints.set(mapping(_toArray(points.subarray(i, i + oldRn)), j), j * newRn);
  }

  this.points = newPoints;
  this.rn = newRn;
  return this;
};

PointSet.prototype.filter = function (iterator) {
  var points = this.points;
  var length = points.length;
  var filtered = new Float32Array(length);
  var rn = this.rn;
  var i, j, k;
  var point;
  var pointset;

  for (i = j = k = 0; i < length; i += rn, j += 1) {
    point = points.subarray(i, i + rn);
    if (iterator(point, j)) {
      filtered.set(point, k);
      k += rn;
    }
  }

  filtered = filtered.subarray(0, k);
  this.points = filtered;
  return this;
  // pointset = new PointSet();
  // pointset.points = filtered;
  // pointset.rn = rn;
  // pointset.size = k / rn;

  // return pointset;
};


// return a list indices that satisfy the predicate
PointSet.prototype.selectIndices = function( predicate ) {
  var points = this.points;
  var length = points.length;
  var out = [];
  var filtered = new Float32Array(length);
  var rn = this.rn;
  var i, j, k;
  var point;
  var pointset;

  for (i = j = k = 0; i < length; i += rn, j += 1) {
    point = points.subarray(i, i + rn);
    if (predicate(point, j)) {
      out.push( j );
      k += rn;
    }
  }

  return out;
}

PointSet.prototype.merge = function (precision) {
  var precision = precision || 1e-4;
  var points = this.points;
  var length = points.length;
  var rn = this.rn;
  var size = this.size;
  var indices = new Uint32Array(size);
  var merged = new Float32Array(length);
  var usedIndices = 0;
  var usedCoords = 0;
  var vertexAdded;
  var equals;
  var i, j, k;

  for (i = 0; i < length; i += rn) {
    vertexAdded = false;
    for (j = 0; j < usedCoords && !vertexAdded; j += rn) {
      equals = true;
      for (k = 0; k < rn; k += 1) {
        points[i+k] = Math.round(points[i+k] / precision) * precision;
        equals &= points[i+k] === merged[j+k];
      }
      vertexAdded |= equals;
    }
    indices[i/rn] = !vertexAdded ? usedIndices : j/rn-1;
    if (!vertexAdded) {
      for (k = 0; k < rn; k += 1) {
        merged[usedCoords+k] = points[i+k];
      }
      usedIndices += 1;
      usedCoords = usedIndices*rn;
    }
  }

  this.points = merged.subarray(0, usedCoords);

  return indices;
};

PointSet.prototype.fuse = function(other) {
  if ( !(this.rn === other.rn) ) {
    throw new Error( 'Only supprt this operation for same rn now' );
  }

  var thisLength = this.size * this.rn;
  var otherLength = other.size * other.rn;
  var length = thisLength + otherLength;
  var combined = new Float32Array( length );

  var i, thisPoints = this.points, otherPoints = other.points;

  for ( i = 0; i < thisLength; ++i ) {
    combined[ i ] = thisPoints[ i ];
  }

  for ( i = 0; i < otherLength; ++i ) {
    combined[ i + thisLength ] = otherPoints[ i ];
  }

  this.points = combined;
  return this;
};

PointSet.prototype.rotate = function (dims, angle) {
  var maxDim = Math.max.apply(null, dims.concat(this.rn - 1));
  this.embed(maxDim + 1);
  var rn = this.rn;

  var dims = dims[0] > dims[1] ? [dims[1], dims[0]] : dims;
  var points = this.points;
  var length = points.length;
  var cos_a = Math.cos(angle);
  var sin_a = Math.sin(angle);
  var r_ii = cos_a;
  var r_ij = -sin_a;
  var r_ji = sin_a;
  var r_jj = cos_a;
  var d_i = dims[0];
  var d_j = dims[1];
  var v_i;
  var v_j;
  var i, j, k;

  if ((dims[0] + dims[1]) % 2 == 0) {
    r_ij *= -1;
    r_ji *= -1;
  }

  for (k = 0, i = d_i, j = d_j; k < length; k += rn, i = k + d_i, j = k + d_j) {
    v_i = points[i];
    v_j = points[j];
    points[i] = v_i * r_ii + v_j * r_ij;
    points[j] = v_i * r_ji + v_j * r_jj;
  }

  return this;
};

PointSet.prototype.scale = function (dims, values) {
  var maxDim = Math.max.apply(null, dims.concat(this.rn - 1));
  this.embed(maxDim + 1);
  var rn = this.rn;

  var points = this.points;
  var length = points.length;
  var dimsLength = dims.length;
  var i, j;

  for (i = 0; i < length; i += rn) {
    for (j = 0; j < dimsLength; j += 1) {
      points[i+dims[j]] *= values[j];
    }
  }

  return this;
};

PointSet.prototype.translate = function (dims, values) {
  var maxDim = Math.max.apply(null, dims.concat(this.rn - 1));
  this.embed(maxDim + 1);
  var rn = this.rn;

  var points = this.points;
  var length = points.length;
  var dimsLength = dims.length;
  var i, j;

  for (i = 0; i < length; i += rn) {
    for (j = 0; j < dimsLength; j += 1) {
      points[i+dims[j]] += values[j];
    }
  }
  return this;
};

PointSet.prototype.transform = function (matrix) {
  // body...

  return this;
};

PointSet.prototype.embed = function (dim) {
  var dim = dim || this.rn + 1;
  var rn = this.rn;
  var minDim = Math.min(rn, dim);
  var oldPoints = this.points;
  var oldLength = oldPoints.length;
  var length = oldLength / rn * dim;
  var points = new Float32Array(length);
  var i, j, k;

  for (i = 0, j = 0; i < oldLength; i += rn, j += dim) {
    for (k = 0; k < minDim; k += 1) {
      points[j + k] = oldPoints[i + k];
    }
  }

  this.points = points;
  this.rn = dim;

  return this;
};

function notZero( x ) { return x !== 0; }

function sign( x ) {
  if ( x > 0 ) {
    return 1;
  } else if ( x < 0 ) {
    return -1;
  } else {
    return 0;
  }
};

function makeForEach( size ) {
  return function( arr, fn ) {
    var i = 0, len = arr.length, ind = 0;
    while ( i < len ) {
      fn( arr.subarray( i, i + size ), ind, arr );
      i = i + size;
      ind = ind + 1;
    }
  }
}

PointSet.prototype.extrude = function( hlist ) {
  var quotes = hlist
    .reduce( function( quotes, incr ) {
      var sofar = quotes[ quotes.length - 1 ];
      quotes.push( sofar + incr );
      return quotes;
    }, [ 0 ] );
  var rn = this.rn;
  var newRn = rn + 1;
  var oldPoints = this.points;
  var newPoints = [];
  var forEachRn = makeForEach( rn );
  quotes.forEach( function( q ) {
    forEachRn( oldPoints, function( point, ind ) {
      Array.prototype.forEach.call( point, function( val ) {
        newPoints.push( val );
      } );
      newPoints.push( q );
    } );
  } );

  this.rn = newRn;
  this.points = new Float32Array( newPoints );
  return this;
};

PointSet.prototype.prod = function(pointset) {
  var size = this.size;
  var rn = this.rn;
  var pointsetSize = pointset.size;
  var pointsetRn = pointset.rn;
  var newSize = size * pointsetSize;
  var newRn = rn + pointsetRn;
  var newLength = newSize * newRn;
  var newPoints = new Float32Array(newLength);
  var newPoint, point1, point2;
  var i, j;
  var n = 0;

  for (j = 0; j < pointsetSize; j += 1) {
    point2 = pointset.get(j);
    for (i = 0; i < size; i += 1) {
      newPoint = new Float32Array(newRn);
      point1 = this.get(i);
      newPoint.set(point1);
      newPoint.set(point2, rn);
      newPoints.set(newPoint, newRn*n++);
    }
  }

  this.points = newPoints;
  this.rn = newRn;

  return this;
};

module.exports = exports = PointSet;
