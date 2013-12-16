
var THREE = require( 'three' );

function ColorMap( iseGeom, iseField ) {
  var geometry, material;


  THREE.Mesh.call( this, geometry, material );

}
ColorMap.prototype = Object.create( THREE.Mesh.prototype );
ColorMap.prototype.constructor = ColorMap;


module.exports = exports = ColorMap;
