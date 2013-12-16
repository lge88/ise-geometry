
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

module.exports = exports = ISETopology;

function ISETopology( complex, dim ) {
  return this._computeTopology( complex, dim );
};

function __static__() {}

ISETopology.fromJSON = function( json ) {
  json = typeof json === "string" ? JSON.parse( json ) : json;
  var complexes = new Array();
  var topology = new ISETopology();

  json.complexes.forEach( function( complex ) {
    complexes.push( new Uint32Array( complex ));
  } );

  topology.complexes = complexes;

  return topology;
};

function makeForEach( size ) {
  return function( arr, fn ) {
    var i = 0, len = arr.length, ind = 0;
    while ( i < len ) {
      fn( arr.subarray( i, i + size ), ind, arr );
      i = i + size;
      ind = ind + 1;
    }
  };
}

ISETopology.prototype._computeTopology = function( complex, dim ) {
  complex || ( complex = [ [] ] );
  var complexes = new Array();
  var complexTemp, complexNext;
  var complexNextLength;
  var complexLength;
  var cellDim;
  var d, c, i, j, k;
  var exchange1, exchange2;

  // guess dim:
  if ( typeof dim === 'undefined' &&
       complex && complex[ 0 ] &&
       Array.isArray( complex[ 0 ] ) ) {
    dim = this.getDimFromCellSize( complex[ 0 ].length );
  }

  if ( Array.isArray( complex ) ) {
    complex = _flat( complex );
  }

  if ( dim >= 0 ) {
    // complexes[ 0 ] = new Uint32Array();
    complexes[ dim ] = new Uint32Array( complex );
  }

  var forEach, tmp, cellSize, cellTopo;
  for ( d = dim; d > 1; d -= 1 ) {
    cellSize = this.getCellSize( d );
    forEach = makeForEach( cellSize );
    cellTopo = this.cellTopologies[ d - 1 ];
    tmp = [];
    forEach( complexes[ d ], function( globalConn, ind ) {
      cellTopo.forEach( function( cellConn ) {
        cellConn.forEach( function( i ) {
          tmp.push( globalConn[ i ] );
        } );
      } );
    } );
    complexes[ d-1 ] = new Uint32Array( tmp );
  }
  this.complexes = complexes;
  if ( dim > 0 ) {
    complexes[ 0 ] = this.cells0d();
  }
  return this;
};

ISETopology.prototype.__defineGetter__( 'dim', function() {
  return this.complexes.length - 1;
} );

ISETopology.prototype.__defineGetter__( 'maxCells', function() {
  return this.complexes[this.dim];
} );

function __queries__() {}

ISETopology.prototype.toJSON = function() {
  var json = {};
  var complexes = [];

  this.complexes.forEach( function( complex ) {
    complexes.push( _toArray( complex ) );
  } );

  json.complexes = complexes;
  json.dim = this.dim;

  return json;
};

ISETopology.prototype.clone = function() {
  var clone = new this.constructor();
  var dim = this.dim;
  var complexes = new Array();
  var i;

  this.complexes.forEach( function( complex, i ) {
    complexes[i] = new Uint32Array( complex );
  } );

  clone.complexes = complexes;

  return clone;
};

ISETopology.prototype.equals = function( other ) {
  var complexes1 = this.complexes;
  var complexes2 = other.complexes;
  var dim1 = this.dim;
  var dim2 = other.dim;
  var i;

  if ( dim1 !== dim2 ) return false;
  for ( i = 0; i < dim1; i += 1 ) {
    if ( !_areEqual( complexes1[i], complexes2[i] ) ) return false;
  }
  return true;
};
ISETopology.prototype.isEqualTo = ISETopology.prototype.equals;

ISETopology.prototype.cells0d = function() {
  var complexes = this.complexes || [[]];
  var cells1d = complexes[1] || [];
  var length = cells1d.length;
  var cells0d = new Uint32Array( length );
  var i, j;
  var k = 0;
  var found;

  var tmp = [];
  for ( i = 0; i < length; ++i ) {
    tmp[ cells1d[ i ] ] = 1;
  }

  var len = tmp.length;
  for ( i = 0; i < len; ++i ) {
    if ( tmp[ i ] === 1 ) {
      cells0d[ k++ ] = i;
    }
  }

  return cells0d.subarray( 0,k );
};

// Must be override
ISETopology.prototype.cellTopologies = [];
ISETopology.prototype.cellDimTypeMap = {};
ISETopology.prototype.cellDimSizeMap = {};
ISETopology.prototype.cellSizeDimMap = {};

ISETopology.prototype.getCellType = function( dim ) {
  dim || ( dim = this.dim );
  return this.cellDimTypeMap[ dim ];
};

ISETopology.prototype.getCellSize = function( dim ) {
  dim || ( dim = this.dim );
  return this.cellDimSizeMap[ dim ];
};

ISETopology.prototype.getNumOfCellsInDim = function( dim ) {
  var cellSize = this.getCellSize( dim );
  return this.complexes[ dim ].length / cellSize;
};

ISETopology.prototype.getDimFromCellSize = function( cellSize ) {
  return this.cellSizeDimMap[ cellSize ];
};

ISETopology.prototype.getPointIndices = function() {
  return _toArray( this.complexes[ 0 ] );
}

ISETopology.prototype.getEdgeIndices = function() {
  var forEach = makeForEach( 2 );
  var out = [];
  forEach( this.complexes[ 1 ], function( val ) {
    out.push( _toArray( val ) );
  } );
  return out;
};

ISETopology.prototype.getFaceIndices = function() {
  var forEach = makeForEach( 3 );
  var out = [];
  forEach( this.complexes[ 2 ], function( val ) {
    out.push( _toArray( val ) );
  } );
  return out;
};

ISETopology.prototype.getConnectivity = function() {
  return this.maxCells;
};

function __commands__() {}

ISETopology.prototype.remap = function( mapping ) {
  var length;
  var i;

  this.complexes
    .forEach( function( complex ) {
      length = complex.length;
      for ( var i = 0; i < length; i += 1 ) {
        complex[i] = mapping[complex[i]];
      }
    } );

  return this;
};

ISETopology.prototype.unique = function() {
  var dim = this.dim;
  var complex = this.complexes[ dim ];
  var cellSize = this.getCellSize( dim );

  var each = makeForEach( cellSize );
  var cells = [], seen = {};

  // for each cell in complex, use sorted index make a hash key
  each( complex, function( cell ) {
    var cellCopy = Array.prototype.slice.call( cell );
    var key = cellCopy.slice().sort().join( ',' );
    if ( !seen[ key ] ) {
      cells.push( cellCopy );
      seen[ key ] = true;
    }
  } );

  this._computeTopology( cells );

  return this;
};


function concatFloat32( a, b ) {
  var aLen = a.length, bLen = b.length;
  var len = aLen + bLen;
  var out = new Float32Array( len );
  var i;

  for ( i = 0; i < aLen; ++i ) {
    out[ i ] = a[ i ];
  }

  for ( i = 0; i < bLen; ++i ) {
    out[ i+aLen ] = b[ i ];
  }

  return out;
}

// var a = new Float32Array( [1,2,3,4] );
// var b = new Float32Array( [1,2,3,4] );
// var c = concatFloat32( a, b )
// console.log("c = ", c);

ISETopology.prototype.fuse = function( other ) {
  if ( !(this.dim === other.dim) ) {
    throw new Error( 'Expect this.dim === other.dim but ' +
                     this.dim === other.dim );
  }

  var dim = this.dim;
  var i = 0;
  for ( i = 0; i <= dim; ++i ) {
    this.complexes[ i ] = concatFloat32( this.complexes[ i ], other.complexes[ i ] );
  }

  return this;
};

ISETopology.prototype.invert = function() {
  var dim = this.dim;
  var complex = this.complexes[dim];
  var length = complex.length;
  var cellSize = this.getCellSize();
  var cells = [];
  var cell;
  var i, j;

  for ( i = 0; i < length; i += cellSize ) {
    cell = [];
    for ( j = 0; j < cellSize; j += 1 ) {
      cell.unshift( complex[i+j] );
    }
    cells.push( cell );
  }

  this._computeTopology( cells );
};

ISETopology.prototype.skeleton = function( ord ) {
  var dim = this.dim;
  ord = ord === undefined ? dim - 1 : ord;
  var out = dim - ord;

  while ( out-- ) this.complexes.pop();

  return this;
};

ISETopology.prototype.boundary = function() {
  var dim = this.dim - 1;

  this.skeleton( dim );

  var complexes = this.complexes;
  // var cellLength = dim + 1;
  var cellLength = this.getCellSize();
  var cells = complexes[dim];
  var cellsLength = cells.length;
  var cellsSize = cellsLength / cellLength;
  var sortedCells = new Uint32Array( cells );
  var notBoundaryCells = new Uint8Array( cellsSize );
  var boundary;
  var boundarySize = cellsSize;
  var cell;
  var equal;
  var i, j, b, c;

  for ( i = 0; i < cellsLength; i += cellLength ) {
    _quickSort( sortedCells.subarray( i, i + cellLength ));
  }
  for ( c = 0; c < cellsSize; c += 1 ) {
    cell = sortedCells.subarray( c * cellLength, c * cellLength + cellLength );
    if ( !notBoundaryCells[c] ) {
      for ( i = c + 1; i < cellsSize; i += 1 ) {
        equal = true;
        for ( j = 0; j < cellLength && equal; j += 1 ) {
          equal &= sortedCells[i*cellLength+j] === cell[j];
        }
        notBoundaryCells[c] |= equal;
        notBoundaryCells[i] |= equal;
      }
    }
  }
  for ( c = 0; c < cellsSize; c += 1 ) {
    boundarySize -= notBoundaryCells[c];
  }
  boundary = new Uint32Array( boundarySize * cellLength );
  for ( c = 0, b = 0; c < cellsSize; c += 1 ) {
    if ( !notBoundaryCells[c] ) {
      for ( i = 0; i < cellLength; i += 1 ) {
        boundary[b++] = cells[c*cellLength+i];
      }
    }
  }

  this._computeTopology( boundary, dim );
  return this;
};

module.exports = exports = ISETopology;
