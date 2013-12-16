
var THREE = require( 'three' );
var _ = require( 'underscore' );

exports.toThreeMesh = toThreeMesh;
exports.toThreeGeometry = toThreeGeometry;

var visualMaterials = [
  {
    id: 'particalDefault',
    type: 'ParticleBasicMaterial',
    color: 'red',
    size: 4,
    sizeAttenuation: false
  },
  {
    id: 'particalVertexColor',
    type: 'ParticleBasicMaterial',
    size: 4,
    vertexColors: THREE.VertexColors,
    sizeAttenuation: false
  },
  {
    id: 'lineDefault',
    type: 'LineBasicMaterial',
    color: 'blue',
    lineWidth: 1
  },
  {
    id: 'lineVertexColor',
    type: 'LineBasicMaterial',
    vertexColors: THREE.VertexColors,
    lineWidth: 1
  },
  {
    id: 'meshDefault',
    type: 'MeshLambertMaterial',
    color: 0x999999,
    shading: THREE.FlatShading,
    vertexColors: THREE.FaceColors
  },
  {
    id: 'meshVertexColor',
    type: 'MeshBasicMaterial',
    vertexColors: THREE.VertexColors,
  }
];

exports.visualMaterials = visualMaterials = visualMaterials
  .map( function( m ) {
    return [ m.id, new THREE[ m.type ]( _.omit( m, 'id', 'type' ) ) ];
  } )
  .reduce( function( o, m ) {
    o[ m[ 0 ] ] = m[ 1 ];
    return o;
  }, {} );

function toThreeGeometry( colors, geometry ) {

  var pointset = this.pointset;
  var topology = this.topology;
  var dim = topology.dim;

  geometry || (geometry = new THREE.Geometry());
  // var geometry = new THREE.Geometry();
  var vertices = geometry.vertices = [];
  var v, v1, v2, v3;

  if (dim <= 0) {
    topology
      .getPointIndices()
      .forEach(function( i ) {
        v = pointset.get( i );
        vertices.push(
          new THREE.Vector3( v[ 0 ] || 0, v[ 1 ] || 0, v[ 2 ] || 0 )
        );
      });

    if ( colors ) {
      geometry.colors = colors;
    }
  } else if (dim === 1) {
    var edgeColors = [];
    topology
      .getEdgeIndices()
      .forEach(function( edge ) {
        var i1 = edge[ 0 ], i2 = edge[ 1 ];
        var v1 = pointset.get( i1 );
        var v2 = pointset.get( i2 );
        vertices.push(
          new THREE.Vector3( v1[ 0 ] || 0, v1[ 1 ] || 0, v1[ 2 ] || 0 ),
          new THREE.Vector3( v2[ 0 ] || 0, v2[ 1 ] || 0, v2[ 2 ] || 0 )
        );
        if ( colors ) {
          edgeColors.push( colors[ i1 ], colors[ i2 ] );
        }
      });

    if ( edgeColors.length ) {
      geometry.colors = edgeColors;
    }
  } else {

    var faces = geometry.faces = [];
    var faceIndices = topology.getFaceIndices();

    pointset.forEach(function (v) {
      vertices.push(
        new THREE.Vector3(v[0] || 0, v[1] || 0, v[2] || 0)
      );
    });

    faceIndices
      .forEach(function( face ) {
        var i1 = face[ 0 ], i2 = face[ 1 ], i3 = face[ 2 ];
        // no duplicate vertex
        if ( i1 !== i2 && i2 !==i3 && i3 !== i1 ) {
          var f = new THREE.Face3( i1, i2, i3 );
          if ( colors ) {
            f.vertexColors[ 0 ] = colors[ i1 ];
            f.vertexColors[ 1 ] = colors[ i2 ];
            f.vertexColors[ 2 ] = colors[ i3 ];
          }
          faces.push( f );
        }
      });

    geometry.computeCentroids();
    // merge vertices is expensive and buggy
    // geometry.mergeVertices();
    geometry.computeFaceNormals();
    // geometry.computeVertexNormals();
    // geometry.computeTangents();

    if ( colors ) {
      geometry.colors = colors;
    }
  }

  geometry.dynamic = true;
  geometry.verticesNeedUpdate = true;
  geometry.elementsNeedUpdate = true;
  geometry.uvsNeedUpdate = true;
  geometry.normalsNeedUpdate = true;
  geometry.tangentsNeedUpdate = true;
  geometry.colorsNeedUpdate = true;
  geometry.lineDistancesNeedUpdate = true;
  geometry.buffersNeedUpdate = true;

  return geometry;
}

function toThreeMesh( options ) {
  options || ( options = {} );
  var colors = options.colors;

  var dim = this.topology.dim;
  var geometry = this.toThreeGeometry( colors );
  var material;
  var mesh;

  if (dim <= 0) {
    if ( colors ) {
      material = visualMaterials.particalVertexColor;
    } else {
      material = visualMaterials.particalDefault;
    }
    mesh = new THREE.ParticleSystem(geometry, material);
  } else if (dim === 1) {
    if ( colors ) {
      material = visualMaterials.lineVertexColor;
    } else {
      material = visualMaterials.lineDefault;
    }
    mesh = new THREE.Line(geometry, material, THREE.LinePieces);
  } else {
    if ( colors ) {
      material = visualMaterials.meshVertexColor;
    } else {
      material = visualMaterials.meshDefault;
    }

    mesh = new THREE.Mesh( geometry, material );
  }

  mesh.matrixAutoUpdate = true;
  mesh.doubleSided = exports.DRAW_SINGLE_SIDE ? true : false;
  return mesh;
}
