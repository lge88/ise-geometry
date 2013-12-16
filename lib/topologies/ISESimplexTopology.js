

var utils = require( '../utils' );
var _flat = utils._utils._flat;
var ISETopology = require( '../ISETopology' );

function ISESimplexTopology() {
  return ISETopology.apply( this, arguments );
}
ISESimplexTopology.prototype = Object.create( ISETopology.prototype );
ISESimplexTopology.prototype.constructor = ISESimplexTopology;


ISESimplexTopology.prototype.cellTopologies = [
  // 1 -> 0
  [ [ 0 ], [ 1 ] ],
  // 2 -> 1
  [ [ 1, 2 ], [ 2, 0 ], [ 0, 1 ] ],
  // [ [ 0, 1 ], [ 1, 2 ], [ 2, 0 ] ],
  // 3 -> 2
  [ [ 1, 2, 3 ], [ 0, 3, 2 ], [ 0, 1, 3 ], [ 0, 2, 1 ] ],
];

ISESimplexTopology.prototype.cellDimSizeMap = {
  0: 1,
  1: 2,
  2: 3,
  3: 4
};

ISESimplexTopology.prototype.cellSizeDimMap = {
  1: 0,
  2: 1,
  3: 2,
  4: 3
};

ISESimplexTopology.prototype.cellDimTypeMap = {
  0: 'P',
  1: 'L2',
  2: 'T3',
  3: 'T4'
};


// ISESimplexTopology.prototype.cellExtrudeMap =[
//   // 0 -> 1,
//   [ [ 0, 1 ] ],
//   // 1 -> 2,
//   [ [ 0, 1, 3, 2 ] ],
//   // 2 -> 3,
//   [
//     [ 0, 1, 2, 3, 4, 5, 6, 7 ],
//   ],
// ];

ISESimplexTopology.prototype.cellExtrudeMap = [
  // 0 -> 1,
  [ [ 0, 1 ] ],
  // 1 -> 2,
  [ [ 0, 1, 3 ], [ 3, 2, 0 ] ],
  // 2 -> 3,
  [
    [ 1, 2, 0, 5 ], [ 3, 0, 2, 7 ],
    [ 4, 7, 5, 0 ], [ 6, 5, 7, 2 ],
    [ 0, 2, 7, 5 ], [ 0, 7, 2, 3 ]
  ]
];

function getNumOfPointsFromNumOfCells( n, dim ) {
  if ( dim === 0 ) {
    return 1;
  }
}
// flags = [ 1, 1, 0, 0, 1, ..]
// 1: create cells
// 0: skip layer
ISESimplexTopology.prototype._extrude = function( flags ) {
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

module.exports = exports = ISESimplexTopology;
