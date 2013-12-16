
var ISETopology = require( '../ISETopology' );

function ISECubeTopology() {
  return ISETopology.apply( this, arguments );
}
ISECubeTopology.prototype = Object.create( ISETopology.prototype );
ISECubeTopology.prototype.constructor = ISECubeTopology;

ISECubeTopology.prototype.cellTopologies = [
  // 1 -> 0
  [ [ 0 ], [ 1 ] ],
  // 2 -> 1
  [ [ 0, 1 ], [ 1, 2 ], [ 2, 3 ], [ 3, 0 ] ],
  // 3 -> 2
  [
    [ 0, 3, 2, 1 ], [ 0, 1, 5, 4 ],
    [ 1, 2, 6, 5 ], [ 4, 5, 6, 7 ],
    [ 2, 3, 7, 6 ], [ 3, 0, 4, 7 ]
  ],
];

ISECubeTopology.prototype.cellDimSizeMap = {
  0: 1,
  1: 2,
  2: 4,
  3: 8
};

ISECubeTopology.prototype.cellSizeDimMap = {
  1: 0,
  2: 1,
  4: 2,
  8: 3
};

ISECubeTopology.prototype.cellDimTypeMap = {
  0: 'P',
  1: 'L2',
  2: 'Q4',
  3: 'H8'
};

ISECubeTopology.prototype.cellExtrudeMap =[
  // 0 -> 1,
  [ [ 0, 1 ] ],
  // 1 -> 2,
  [ [ 0, 1, 3, 2 ] ],
  // 2 -> 3,
  [
    [ 0, 1, 2, 3, 4, 5, 6, 7 ],
  ],
];

//   [
//   // 0 -> 1,
//   [ [ 0, 1 ] ],
//   // 1 -> 2,
//   [ [ 0, 1, 2 ], [ 2, 3, 0 ] ],
//   // 2 -> 3,
//   [
//     [ 1, 2, 0, 5 ], [ 3, 0, 2, 7 ],
//     [ 4, 7, 5, 0 ], [ 6, 5, 7, 2 ],
//     [ 0, 2, 7, 5 ], [ 0, 7, 2, 3 ]
//   ],
// ];

function getNumOfPointsFromNumOfCells( n, dim ) {
  if ( dim === 0 ) {
    return 1;
  }
}

// flags = [ 1, 1, 0, 0, 1, ..]
// 1: create cells
// 0: skip layer
ISECubeTopology.prototype.extrude = function( flags ) {
  var dim = this.dim;
  var cellMap = this.cellExtrudeMap[ dim ];
  var cells = this.complexes[ dim ];
  var numberOfCells = this.getNumOfCellsInDim( dim );
  var cellSize = this.getCellSize( dim );
  var numberOfPoints = this.cells0d().length;
  var forEach = makeForEach( cellSize );
  var newConn = [];
  if ( cellMap ) {
    flags.forEach( function( flag, layer ) {
      var base = layer * numberOfPoints;;
      if ( flag > 0 ) {
        forEach( cells, function( globalConn ) {
          var i, len = globalConn.length;
          var newGlobalConn = [];
          for ( i = 0; i < len; ++i ) {
            newGlobalConn.push( globalConn[ i ] + base );
          }
          for ( i = 0; i < len; ++i ) {
            newGlobalConn.push( globalConn[ i ] + base + numberOfPoints );
          }

          // get the global conn here
          cellMap.forEach( function( localConn ) {
            var newCell = localConn
              .map( function( localIndex ) {
                return newGlobalConn[ localIndex ];
              } );

            newConn.push( newCell );
          } );
        } );
      }
    } );
    this._computeTopology( newConn, dim + 1 );
  }
  return this;
}


ISECubeTopology.prototype.quadToTriMap = [
  [ 0, 1, 2 ],
  [ 2, 3, 0 ]
];

ISECubeTopology.prototype.getFaceIndices = function() {
  var quads = this.complexes[ 2 ];
  var triangles = [], tri;
  var forEach4 = makeForEach( 4 );
  var quadToTriMap = this.quadToTriMap;

  forEach4( quads, function( globalConn ) {
    quadToTriMap.forEach( function( localConn ) {
      tri = localConn.map( function( i ) {
        return globalConn[ i ];
      } );
      triangles.push( tri );
    } );
  } );

  return triangles;
};

module.exports = exports = ISECubeTopology;

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
