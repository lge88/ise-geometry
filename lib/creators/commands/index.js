
var extend = require( 'extend' );

module.exports = exports = function( Complex ) {

  var exports = {};

  extend( exports, require( './base' )( Complex ) );

  return exports;

};
