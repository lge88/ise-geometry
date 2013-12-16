
var creators = require( './creators' );
var extend = require( 'extend' );

function ISEGeometryEditor(){
  // this.use( this.creators.simplicialComplex );
  this.use( this.creators.cubeComplex );
  return this;
}

ISEGeometryEditor.prototype.creators = creators;

ISEGeometryEditor.prototype.use = function( pkg ) {
  extend( this, pkg );
  return this;
};

module.exports = exports = ISEGeometryEditor;
