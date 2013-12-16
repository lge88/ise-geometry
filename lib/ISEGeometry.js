
var utils = require( './utils' );
var _swap = utils._utils._swap;
var _quickSort = utils._utils._quickSort;
var vectorAdd = utils.vector.add;
var vectorSub = utils.vector.sub;
var vectorMul = utils.vector.mul;
var vectorAvg = utils.vector.avg;
var _toArray = utils._utils._toArray;

var PointSet = require( './ISEPointSet' );

function ISEGeometry( points, complex ) {
  points || ( points = [ [] ] );
  complex || ( complex = [ [] ] );

  var Topology = this._getTopologyConstructor();

  this.pointset = new PointSet( points );
  this.topology = new Topology( complex );
};

function __static__() {}

ISEGeometry.fromJSON = function( json ) {
  json = typeof json === "string" ? JSON.parse( json ) : json;
  var geom = new ISEGeometry();
  var Topology = this._getTopologyConstructor();

  geom.pointset = PointSet.fromJSON( json.pointset );
  geom.topology = Topology.fromJSON( json.topology );

  return geom;
};

function __queries__() {}

ISEGeometry.prototype._getTopologyConstructor = function() {
  return require( './topologies/ISESimplexTopology' );
};

ISEGeometry.prototype.getNumOfPoints = function() {
  return this.pointset.size;
};

ISEGeometry.prototype.getDimOfPoints = function() {
  return this.pointset.rn;
};

function makeForEach( size ) {
  return function( arr, fn ) {
    var i = 0, len = arr.length, ind = 0;
    while ( i < len ) {
      fn( arr.subarray( i, i + size ), ind, arr );
      i = i + size;
      ind = ind + 1;
    };
  };
}

ISEGeometry.prototype.getCoordOfPoints = function() {
  var size = this.getNumOfPoints();
  var dim = this.getDimOfPoints();
  var out = [];
  makeForEach( dim )( this.pointset.points, function( x ) {
    out.push( _toArray( x ) );
  } );
  return out;
};

ISEGeometry.prototype.getConnectivities = function() {
  return _toArray( this.topology.maxCells );
};

ISEGeometry.prototype.getConn = ISEGeometry.prototype.getConnectivities;

ISEGeometry.prototype.getPointIndices = function() {
  return this.topology.getPointIndices();
};

ISEGeometry.prototype.getEdgeIndices = function() {
  return this.topology.getEdgeIndices();
};

ISEGeometry.prototype.getFaceIndices = function() {
  return this.topology.getFaceIndices();
};

ISEGeometry.prototype.getCellType = function( dim ) {
  dim || ( dim = this.getDimOfTopology() );
  return this.topology.getCellType( dim );
};

ISEGeometry.prototype.getDimOfTopology = function() {
  return this.topology.dim;
};

ISEGeometry.prototype.getNumOfNodesInCell = function( dim ) {
  dim || ( dim = this.getDimOfTopology() );
  return this.topology.getCellSize( dim );
};

ISEGeometry.prototype.getNN = ISEGeometry.prototype.getNumOfNodesInCell;
ISEGeometry.prototype.getCellSize = ISEGeometry.prototype.getNumOfNodesInCell;


ISEGeometry.prototype.centroids = function( dim ) {
  dim || ( dim = this.getDimOfTopology() );
  var cellSize = this.getCellSize( dim );
  var cellsSize = this.topology.complexes[ dim ].length / cellSize;
  var centroids = new PointSet( cellsSize, this.getDimOfPoints() );
  var i;
  var centroid;

  for ( i = 0; i < cellsSize; i += 1 ) {
    centroid = vectorAvg( this.getFacet( dim, i ));
    centroids.set( centroid, i );
  }

  return centroids;
};

ISEGeometry.prototype.getCentroids = ISEGeometry.prototype.centroid;

ISEGeometry.prototype.getFacet = function( dim, index ) {
  var topology = this.topology;
  var pointset = this.pointset;
  var cells = this.topology.complexes[ dim ];
  var size = this.getCellSize();
  var start = size*index;
  var cell = cells.subarray( start, start + size );
  var facet = [];
  var i;

  for ( i = 0; i < size; i += 1 ) {
    facet.push( pointset.get( cell[ i ] ));
  }

  return facet;
};


ISEGeometry.prototype.selectNodes = function( selector ) {
  if ( typeof selector === 'function' ) {
    return this.pointset.selectIndices( selector )
  }

  return [];
}


ISEGeometry.prototype.toJSON = function() {
  var json = {};

  json.pointset = this.pointset.toJSON();
  json.topology = this.topology.toJSON();

  return json;
};

ISEGeometry.prototype.clone = function() {
  var clone = new this.constructor();
  clone.pointset = this.pointset.clone();
  clone.topology = this.topology.clone();
  return clone;
};

ISEGeometry.prototype.isEqualTo = function( geom ) {
  var pointset1 = this.pointset;
  var pointset2 = geom.pointset;
  var topology1 = this.topology;
  var topology2 = geom.topology;

  if ( ! pointset1.equals( pointset2 )) return false;
  if ( ! topology1.equals( topology2 )) return false;

  return true;
};

ISEGeometry.prototype.equals = ISEGeometry.prototype.isEqualTo;

ISEGeometry.prototype.toPolygons = function() {
  return [];
};

function __commands__() {}

ISEGeometry.prototype.fromPolygons = function( polygons ) {
  return this;
};

ISEGeometry.prototype.rotate = function( dims, angle ) {
  this.pointset.rotate( dims, angle );
  return this;
};

ISEGeometry.prototype.scale = function( dims, values ) {
  var invert;

  this.pointset.scale( dims, values );

  invert = values.reduce( function( v1, v2 ) {
    return v1 * v2;
  } );

  if ( invert < 0 ) {
    this.topology.invert();
  };

  return this;
};

ISEGeometry.prototype.translate = function( dims, values ) {
  this.pointset.translate( dims, values );
  return this;
};

ISEGeometry.prototype.transform = function( matrix ) {
  this.pointset.transform( matrix );
  return this;
};

ISEGeometry.prototype.embed = function( dim ) {
  this.pointset.embed( dim );
  return this;
};

ISEGeometry.prototype.merge = function( precision ) {
  precision || ( precision = 1e-4 );
  var mapping = this.pointset.merge( precision );
  this.topology.remap( mapping );
  return this;
};


// Can not handle overlapping cases
// If two domain only connect via their boundary and
// node locations aligned
// works fine
ISEGeometry.prototype.fuse = function( other ) {

  // fuse the pointsets
  // remap other.toplogy
  // make cells unique
  // call this.merge

  var thisSize = this.pointset.size;
  var otherSize = other.pointset.size;
  var otherTopCopy = other.topology.clone();

  this.pointset.fuse( other.pointset );

  var mapping = [], i;
  for ( i = 0; i < otherSize; ++i ) {
    mapping.push( i + thisSize );
  }
  otherTopCopy.remap( mapping );

  this.topology.fuse( otherTopCopy );

  this.topology.unique();

  return this.merge();
};


// use csg to implement this
ISEGeometry.prototype.fuse2 = function( other ) {

  // fuse the pointsets
  // remap other.toplogy
  // make cells unique
  // call this.merge

  var thisSize = this.pointset.size;
  var otherSize = other.pointset.size;
  var otherTopCopy = other.topology.clone();

  this.pointset.fuse( other.pointset );

  var mapping = [], i;
  for ( i = 0; i < otherSize; ++i ) {
    mapping.push( i + thisSize );
  }
  otherTopCopy.remap( mapping );

  this.topology.fuse( otherTopCopy );

  this.topology.unique();

  return this.merge();
};

ISEGeometry.prototype.map = function( mapping ) {
  this.pointset.map( mapping );
  return this;
};

ISEGeometry.prototype.extrude = function( hlist ) { return this; };

ISEGeometry.prototype.explode = function( values ) {
  var dim = this.getDimOfTopology();
  values || ( values = [] );
  var cell;
  // var cellSize = dim + 1;
  var cellSize = this.getCellSize( dim );
  var cells = this.topology.complexes[ dim ];
  var cellsSize = cells.length / cellSize;
  var newCell, newCells = [];
  var pointset = this.pointset;
  var newPointset = new PointSet( cellsSize*cellSize, this.getDimOfPoints() );
  var centroids = this.centroids();
  var centroid;
  var translatedCentroid;
  var translationVect;
  var c, i;
  var indx = 0;

  for ( c = 0; c < cellsSize; c += 1 ) {
    cell = cells.subarray( c*cellSize, c*cellSize + cellSize );
    newCell = [];
    centroid = centroids.get( c );
    translatedCentroid = vectorMul( centroid, values );
    translationVect = vectorSub( translatedCentroid, centroid );
    for ( i = 0; i < cellSize; i += 1 ) {
      newCell.push( indx );
      newPointset.set( vectorAdd( pointset.get( cell[ i ] ), translationVect ), indx );
      indx++;
    }
    newCells.push( newCell );
  }

  var Topology = this._getTopologyConstructor();
  this.pointset = newPointset;
  this.topology = new Topology( newCells );
  return this.merge();
};

ISEGeometry.prototype.skeleton = function( dim ) {
  this.topology.skeleton( dim );
  return this;
};

ISEGeometry.prototype.boundary = function() {
  this.topology.boundary();
  return this;
};

ISEGeometry.prototype.prod = function( geom ) {
  var rn = this.getDimOfPoints();
  var rn2 = geom.getDimOfPoints();
  if ( rn > 1 && rn2 > 2 ) return this;
  if ( rn > 2 && rn2 > 1 ) return this;

  var n = geom.size - 1;
  var pointset = this.pointset.clone().prod( geom.pointset );
  var quotes = [];

  while ( n-- ) quotes.push( 1 );

  this.extrude( quotes );

  this.pointset = pointset;

  return this;
};

module.exports = exports = ISEGeometry;
