
// build scene:
// var cubes = randomCubes().map( function( c ) { viewport.scene.add(c); return c; } );

function block( nx, ny, nz ) {
  var arrgen = require( 'arr-gen' );
  var flatten = require( 'flatten' );

  // check args:
  var args =  Array.prototype.slice.call( arguments );
  if ( args.length === 1 && Array.isArray( args[ 0 ] ) ) {
    args = args[ 0 ];
  }
  args = args.filter( function( n ) {
    return n > 0;
  } );
  var dim = args.length;
  if ( dim > 3 || dim < 1 ) {
    throw new Error( 'block: Unsupported dimension!' );
  }

  // generate nodes:
  var idGen = block.indexer();
  var nodeGenArgs = args.map( function( x ) { return x+1; } );
  var nodeGenFn;
  switch( dim ) {
  case 1:
    nodeGenFn = function( i ) {
      return {
        id: idGen.apply( null, arguments ),
        indices: [ i ],
        elements: [],
        position: { x: i/args[0] }
      };
    };
    break;
  case 2:
    nodeGenFn = function( i, j ) {
      return {
        id: idGen.apply( null, arguments ),
        indices: [ i, j ],
        elements: [],
        position: { x: i/args[0], y: j/args[1] }
      };
    };
    break;
  case 3:
    nodeGenFn = function( i, j, k ) {
      return {
        id: idGen.apply( null, arguments ),
        indices: [ i, j, k ],
        elements: [],
        position: { x: i/args[0], y: j/args[1], z: k/args[2] }
      };
    };
    break;
  }
  nodeGenArgs.push( nodeGenFn );
  var nodes = arrgen.apply( null, nodeGenArgs );

  // generate elements:
  idGen = block.indexer();
  var eleTypes = {
    1: 'truss',
    2: 'quad',
    3: 'stdBrick'
  };
  var eleType = eleTypes[ dim ];

  var eleGenArgs = args.slice();
  var indicesForOneElement;
  switch( dim ) {
  case 1:
    indicesForOneElement = [
      [ 0 ],
      [ 1 ]
    ];
    break;
  case 2:
    indicesForOneElement = [
      [ 0, 0 ],
      [ 1, 0 ],
      [ 1, 1 ],
      [ 0, 1 ]
    ];
    break;
  case 3:
    indicesForOneElement = [
      [ 0, 0, 0 ],
      [ 1, 0, 0 ],
      [ 1, 1, 0 ],
      [ 0, 1, 0 ],
      [ 0, 0, 1 ],
      [ 1, 0, 1 ],
      [ 1, 1, 1 ],
      [ 0, 1, 1 ]
    ];
    break;
  }

  var elements = arrgen( eleGenArgs, function() {
    var ele_mid =  Array.prototype.slice.call( arguments );
    var element = {};

    var localNodes = indicesForOneElement.map( function( delta ) {
      var nodes_mid = sumVector( ele_mid, delta );
      var n = getMultiIndexedValue( nodes, nodes_mid );
      addToSet( n.elements, element );
      return n;
    } );

    element.id = idGen();
    element.indices = ele_mid;
    element.type = eleType;
    element.nodes = localNodes;

    return element;
  } );

  function sumVector( v1, v2 ) {
    return v1.map( function( x, ind ) {
      return v2[ ind ] + x;
    } );
  }

  function addToSet( arr, item ) {
    if ( -1 === arr.indexOf( item ) ) {
      arr.push( item );
      return true;
    }
    return false;
  }

  function getMultiIndexedValue( ndarray, indices ) {
    return indices.reduce( function( val, i ) {
      return val[i];
    }, ndarray );
  }

  function FeBlock( nodes, elements, dim ) {
    this.nodes = nodes;
    this.elements = elements;
    this.dim = dim;
    return this;
  }

  FeBlock.prototype.toJSON = function() {
    return {
      nodes: flatten( this.nodes )
        .map( function( n ) {
          var out = {};
          out.id = n.id;
          out.position = n.position;
          return out;
        } ),
      elements: flatten( this.elements )
        .map( function( el ) {
          var out = {};
          out.id = el.id;
          out.type = el.type;
          out.nodes_id = el.nodes.map( function( n ) {
            return n.id;
          } );
          return out;
        } )
    };
  };

  FeBlock.prototype.applyTransform = function( fn ) {
    flatten( this.nodes )
      .forEach( function( n ) {
        n.position = fn( n.position );
      } );
    return this;
  };

  FeBlock.prototype.getPoints = function() {
    return flatten( this.nodes )
      .map( function( n ) {
        var out = [];
        var pos = n.position;
        ( typeof pos.x !== 'undefined' ) && ( out.push( pos.x ) );
        ( typeof pos.y !== 'undefined' ) && ( out.push( pos.y ) );
        ( typeof pos.z !== 'undefined' ) && ( out.push( pos.z ) );
        return out;
      } );
  }

  FeBlock.prototype.getConn = function() {
    return flatten( this.elements )
      .map( function( el ) {
        return el.nodes.map( function( n ) {
          return n.id - 1;
        } );
      } );
  }

  block.FeBlock = FeBlock;

  return new FeBlock( nodes, elements, dim );
}

block.indexer = function() {
  var id = 1;
  return function() { return id++; };
};

// Object.keys( ISEGeometry.types ).forEach(
//   function( k ) {
//     var T = ISEGeometry.types[ k ].ctor;
//     extend( T.prototype, {
//       draw: function() {
//         viewport.scene.add( this.toThreeMesh() );
//         return this;
//       }
//     } );
//   } );

// var H8 = ISEGeometry.types.H8.ctor;
// console.log( ' n= ' + n );

// console.time( 1 );
// var b1 = block( n, n, n );
// var pts = b1.getPoints();
// var conn = b1.getConn();
// console.timeEnd( 1 );

// console.time( 2 );
// var geo = new H8( pts, conn );
// console.timeEnd( 2 );

// console.time( 3 );
// geo.map( sphereMap() );
// console.timeEnd( 3 );
