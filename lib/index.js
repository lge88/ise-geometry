
// var ISEStructuredGeometry = require( './ISEStructuredGeometry' );
var ISEGeometry = require( './ISEGeometry' );
var ISEGeometryEditor = require( './ISEGeometryEditor' );
var _ = require( 'underscore' );

if ( typeof window !== 'undefined' ) {
  // browser:
  // _.extend( ISEStructuredGeometry.prototype, require( './ISEStructuredGeometry.three' ) );
  _.extend( ISEGeometry.prototype, require( './ISEGeometry.three' ) );
}

// var gcells = require( './gcells' );
// gcells.forEach( function( c ) {
//   ISEStructuredGeometry.register( c );
// } );
module.exports = exports = ISEGeometryEditor;
exports.ISEGeometryEditor = ISEGeometryEditor;
exports.ISEColorMap = require( './ISEColorMap' );
// exports.ISEStructuredGeometry = ISEStructuredGeometry;
// module.exports = exports = ISEStructuredGeometry;
// module.exports = exports = ISEStructuredGeometry;
// require( './ISEGeometry' );
