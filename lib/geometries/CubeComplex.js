
var ISEGeometry = require( '../ISEGeometry' );

function CubeComplex() {
  ISEGeometry.apply( this, arguments );
  return this;
}

CubeComplex.prototype = Object.create( ISEGeometry.prototype );
CubeComplex.prototype.constructor = CubeComplex;

CubeComplex.prototype._getTopologyConstructor = function() {
  return require( '../topologies/ISECubeTopology' );
};

var cellExtrudeMap = [
  // 0 -> 1,
  [ [ 0, 1 ] ],
  // 1 -> 2,
  [ [ 0, 1, 3, 2 ] ],
  // 2 -> 3,
  [
    [ 0, 1, 2, 3, 4, 5, 6, 7 ],
  ],
];

function notZero( x ) { return x !== 0; }

function sign( x ) {
  if ( x > 0 ) {
    return 1;
  } else if ( x < 0 ) {
    return -1;
  } else {
    return 0;
  }
}

CubeComplex.prototype.extrude = function( hlist, flags ) {

  hlist || ( hlist = [] );
  flags || ( flags = hlist.map( function( x ) { return 1; } ) );

  this.pointset.extrude( hlist );
  this.topology.extrude( flags );
  return this;
};

module.exports = exports = CubeComplex;
