var ISEViewport = require( 'ise-viewport' );
var randomCubes = require( 'three-random-cubes' );
var EditorControls = require( 'ise-editor-controls' );
var arrgen = require( 'arr-gen' );
var ISEGeometryEditor = require( 'ise-geometry' ).ISEGeometryEditor;
var ColorMap = require( 'ise-geometry' ).ISEColorMap;
var THREE = require( 'three' );
var extend = require( 'extend' );

var viewport = ISEViewport();
var controls = EditorControls( viewport.camera, viewport.container );

function visualizeGeometry( geo, scene, sceneHelpers ) {
  var meshes = [], helpers = [];
  var g, mesh;

  var colorMapping = ColorMap();
  // var colorMapping = function( arr ) {
  //   var r, g, b;
  //   return normalize( arr )
  //     .map(function( value ) {
  //       if (value <= 0.2) {
  //         r = Math.round(value * 200)+100;
  //         g = Math.round(value * 200)+100;
  //         b = Math.round(value * 250)+150;
  //       } else {
  //         r = Math.round(value * 250);
  //         g = Math.round(value * 250);
  //         b = Math.round(value * 200);
  //       }
  //       return [ r, g, b ].map( function( x ) {
  //         return x/256;
  //       } );
  //     });
  // }

  function linearMap( range1, range2 ) {
    if ( !range2 ) {
      range2 = range1;
      range1 = [ 0, 1 ];
    }
    var a = range1[0];
    var b = range2[0];
    var d1 = range1[1] - range1[0];
    var d2 = range2[1] - range2[0];
    return function( x ) {
      return b + ( x - a ) * d2 / d1;
    };
  }

  function findMinAndMax( list ) {
    return list.reduce( function( sofar, item ) {
      item > sofar.max && ( sofar.max = item );
      item < sofar.min && ( sofar.min = item );
      return sofar;
    }, {
      min: Infinity,
      max: -Infinity,
    } );
  }

  function normalize( vec, min, max ) {
    if ( !min ) {
      var tmp = findMinAndMax( vec );
      min = tmp.min;
      max = tmp.max;
    }
    var mapping = linearMap( [ min, max ], [ 0, 1 ] );

    return vec.map(function( x ) {
      return mapping( x );
    });
  }

  var byDist2D = function( p ) {
    return p[ 0 ]*p[ 0 ] + p[ 1 ]*p[ 1 ];
  };
  var byDist3D = function( p ) {
    return p[ 0 ]*p[ 0 ] + p[ 1 ]*p[ 1 ] + p[ 2 ]*p[ 2 ];
  };

  var createColors = function( geo, fn ) {
    return colorMapping(
      geo.getCoordOfPoints()
        .map( fn )
    ).map( function( arr ) {
      var c = new THREE.Color();
      c.r = arr[ 0 ];
      c.g = arr[ 1 ];
      c.b = arr[ 2 ];
      return c;
    } );
  };

  console.time( 4 );
  g = geo.clone()
    // .explode( [ 3, 3, 3 ] )
  mesh = g.toThreeMesh()
  console.timeEnd( 4 );
  mesh.scale.set( 200, 200, 200 );
  mesh.position.set( 0, 0, 0 );
  meshes.push( mesh );

  helpers.push(
    new THREE.FaceNormalsHelper( mesh, 20 ),
    new THREE.WireframeHelper( mesh )
  );

  console.time( 5 );
  g = geo.clone();
  mesh = g
    .skeleton( 0 )
    .toThreeMesh({ colors:  createColors( geo, byDist3D ) });
  console.timeEnd( 5 );
  mesh.scale.set( 200, 200, 200 );
  mesh.position.set( 500, 0, 0 );
  meshes.push( mesh );

  console.time( 6 );
  g = geo.clone();
  mesh = g
    .skeleton( 1 )
    .toThreeMesh();
  console.timeEnd( 6 );
  mesh.scale.set( 200, 200, 200 );
  mesh.position.set( -500, 0, 0 );
  meshes.push( mesh );

  console.time( 7 );
  g = geo.clone();
  mesh = g
    // .boundary()
    .skeleton( 1 )
    // .explode( [ 1.2 ] )
    .toThreeMesh();
  console.timeEnd( 7 );
  mesh.scale.set( 200, 200, 200 );
  mesh.position.set( 0, -500, 0 );
  meshes.push( mesh );

  console.time( 8 );
  g = geo.clone();
  mesh = g
    .scale( [ 0, 1, 2 ], [ 200, 200, 100 ] )
    .translate( [ 1 ], [ 500 ] )
    .toThreeMesh();
  console.timeEnd( 8 );
  // mesh.scale.set( 200, 200, 200 );
  // mesh.position.set( 0, 500, 0 );
  meshes.push( mesh );

  console.time( 9 );
  g = geo.clone()
    // .skeleton( 1 )
  mesh = g
    // .boundary()
    .explode( [ 2, 2, 2 ] )
    .toThreeMesh( { colors: createColors( g, byDist3D ) } );
  console.timeEnd( 9 );
  mesh.scale.set( 200, 200, 200 );
  mesh.position.set( -500, 500, 0 );
  meshes.push( mesh );

  // console.time( 11 );
  // var c = geo.clone();
  // mesh = geo.clone()
  //   .boundary()
  //   .explode( [ 1.2, 1.2, 1.2 ] )
  //   .skeleton( 1 )
  //   .toThreeMesh();
  // console.timeEnd( 11 );
  // mesh.scale.set( 200, 200, 200 );
  // mesh.position.set( 500, 500, 0 );
  // // mesh.material.wireframe = true;
  // meshes.push( mesh );

  g = geo.clone();
  mesh = g
    .toThreeMesh({ colors: createColors( g, byDist2D ) });
  mesh.scale.set( 200, 200, 200 );
  mesh.position.set( 500, 500, 0 );
  meshes.push( mesh );

  meshes.forEach( function( m ) {
    scene.add( m );
  } );

  helpers.forEach( function( m ) {
    sceneHelpers.add( m );
  } );
}

// visualizeGeometry( geo, viewport.scene );

var n = 6;
var editor = new ISEGeometryEditor;
// editor.use( editor.creators.simplicialComplex );
editor.use( editor.creators.cubeComplex );
var geo2 = editor
  // .intervals( 1, 2 )
  // .extrude( [ 1 ] )
  // .extrude( [ 1 ] )
  // .map( function( v ) {
  //   return v.map( function( x ) { return 200*x; } );
  // } )
  // .scale( [ 0, 1 ], [ 200, 200 ] );
  .domain(
    [ [ 0, 1 ], [ 0, 1 ], [ 0, 1 ] ],
    [ n, n, n ]
  )
  // .map( sphereMap( 0.2 ) )

var s = editor
  // .disk()
  // .skeleton( 0 )
  // .cylinderSurface()
  // .helix()
  // .domain( [ [0,1], [0,1], [0,1] ], [ 10, 10, 10 ] )
  // .explode( [ 2.2, 2.2 ] )
  // .scale( [ 0, 1, 2 ], [ 200, 200, 200 ] )

// console.log( JSON.stringify(s.pointset.toJSON()))
// console.log( JSON.stringify(s.topology.toJSON()))
// console.log( s.toThreeMesh().geometry.faces.map(function(f){return [f.a,f.b,f.c].join()}) );

visualizeGeometry( geo2, viewport.scene, viewport.sceneHelpers );
// visualizeGeometry( s, viewport.scene );
// showIndiceMap( s );


function linearMap( range1, range2 ) {
  if ( !range2 ) {
    range2 = range1;
    range1 = [ 0, 1 ];
  }
  var a = range1[0];
  var b = range2[0];
  var d1 = range1[1] - range1[0];
  var d2 = range2[1] - range2[0];
  return function( x ) {
    return b + ( x - a ) * d2 / d1;
  }
}

function sphereMap( rin ) {
  var f1 = linearMap( [0,1], [-Math.PI/2, Math.PI/2] );
  var f2 = linearMap( [0,1], [0, 2*Math.PI] );
  var f3 = linearMap( [0,1], [rin || 0, 1] );
  return function( v ) {
    var r = f3( v[0] ), theta = f1( v[1] ), beta = f2( v[2] );
    v[0] = r * Math.cos( theta )*Math.cos( beta );
    v[1] = r * Math.cos( theta )*Math.sin( beta );
    v[2] = r * Math.sin( theta );
    return v;
  }
}
