
var ISEGeometry = require( '../ISEGeometry' );
var PointSet = require( '../ISEPointSet' );
var utils = require( '../utils' )._utils;
var _quickSort = utils._quickSort;
var _swap = utils._swap;

function SimplicialComplex() {
  ISEGeometry.apply( this, arguments );
  return this;
}

SimplicialComplex.prototype = Object.create( ISEGeometry.prototype );
SimplicialComplex.prototype.constructor = SimplicialComplex;

SimplicialComplex.prototype._getTopologyConstructor = function() {
  return require( '../topologies/ISESimplexTopology' );
}

SimplicialComplex.prototype.extrude = function( hlist ) {
  hlist || ( hlist = [ 1 ] );
  var hlistLength = hlist.length;
  var hlist0 = hlist[ 0 ];
  var hlist0isNegative = hlist0 < 0;
  var positiveQuotes = hlist.filter( function( h ) { return h >= 0; } ).length;

  var oldRn = this.getDimOfPoints();
  var newRn = oldRn + 1;
  var pointset = this.pointset;
  var pointsetSize = pointset.size;
  var oldEmbeddedPoints;
  var oldPointsLength = pointsetSize * oldRn;
  var newPointsLength = pointsetSize * newRn;
  var newPoints = new Float32Array( newPointsLength );

  var newPointsetSize = ( hlistLength + 1 - ( hlist0isNegative )) * pointsetSize;
  var newPointset = new PointSet( newPointsetSize, newRn );

  var oldDim = this.getDimOfTopology();
  var newDim = oldDim + 1;
  var topology = this.topology;
  // var cellLength = oldDim + 1;
  var cellLength = this.getCellSize( oldDim );
  var complex = topology.complexes[ oldDim ];
  var complexLength = complex.length;
  var complexSize = complexLength / cellLength;

  // var newCellLength = newDim + 1;
  var newCellLength = this.getCellSize( newDim );
  var newComplexLength = positiveQuotes * complexSize * newDim * newCellLength;
  var newComplex = new Uint32Array( newComplexLength );

  var tempLength = 2 * cellLength;
  var temp = new Uint32Array( tempLength );
  var tempIndx;
  var cIndx = 0 ;
  var exchange1, exchange2;
  var end;
  var quote = 0;
  var h, v, c, i, j;

  for ( i = 0; i < complexLength; i += cellLength ) {
    _quickSort( complex.subarray( i, i + cellLength ));
  }

  this.embed();
  oldEmbeddedPoints = this.pointset.points;
  newPoints.set( oldEmbeddedPoints );
  if ( !hlist0isNegative ) newPointset.set( oldEmbeddedPoints );

  for ( h = 0; h < hlistLength; h += 1 ) {
    quote += Math.abs( hlist[ h ] );

    // add new points
    for ( v = newRn - 1; v < newPointsLength; v += newRn ) {
      newPoints[ v ] = quote;
    }
    newPointset.set( newPoints, ( h + 1 - ( hlist0isNegative )) * pointsetSize );

    // create new cells
    if ( hlist[ h ] >= 0 ) {
      for ( c = 0; c < complexSize; c += 1 ) {
        // fill temp with selected indexes
        for ( i = 0; i < cellLength; i++ ) {
          tempIndx = complex[ c*cellLength+i ] + ( h - ( hlist0isNegative )) * pointsetSize;
          temp[ i ] = tempIndx;
          temp[ i+cellLength ] = tempIndx + pointsetSize;
        }

        // pick cells from temp, cellLength by cellLength
        for ( i = 0; i < cellLength; i += 1 ) {
          end = i + cellLength + 1;
          for ( j = i; j < end; j++ ) {
            newComplex[ cIndx++ ] = temp[ j ];
          }
          // take care of orientation
          if ( (( newDim & 1 ) * ( c ) + ( oldDim & 1 ) * i ) & 1 ) {
            exchange1 = cIndx - 1;
            exchange2 = exchange1 - 1;
            _swap( newComplex, exchange1, exchange2 );
          }
        }
      }
    }
  }

  var Topology = this._getTopologyConstructor();
  this.pointset = newPointset;
  this.topology = new Topology( newComplex, newDim );
  return this;
};

module.exports = exports = SimplicialComplex;
