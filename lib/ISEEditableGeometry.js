
// API: ISEEditableGeometry
// Data types:
//   Index :: Int
//   Point :: [ Number ]
//   Connectivity :: [ Index ],
// Class methods:
//   register :: ( Object ) -> ()
//   fromJSON :: ( Object ) -> ISEGeometry
// Events:
// Instance members:
//   pointset :: ISEPointSet
//   topologies :: [ ISETopology ]
// Instance methods:
//   constructor :: ISEGeometry -> ISEEditableGeometry
// query:
//   getNumOfPoints :: void -> Int
//   getDimOfPoints :: void -> Int
//   getCoordOfPoints :: void -> [ [ Number ] ]
//   isStructured :: void -> Boolean
//   getConnectivities :: void -> [ Connectivity ]
//   getConn :: getConnectivities
//   getPointIndices :: void -> [ Int ]
//   getEdgeIndices :: void -> [ ( Int, Int ) ]
//   getFaceIndices :: void -> [ ( Int, Int, Int ) ]
//   getTypeOfCells :: void -> Int | [ Int ]
//   getDimOfCells :: void -> Int | [ Int ]
//   getNumOfNodesOfCells :: void -> Int | [ Int ]
//   getNN :: getNumOfNodesOfCells
//   [*] getCentroids :: Number -> ISEPointSet
//   [*] getFacet :: Number -> Number -> [ Number ]
//   toJSON :: () -> Object
//   clone :: () -> ISEGeometry
//   isEqualTo :: ( ISEGeometry ) -> Boolean
// command:
//   rotate :: [ Int ] -> [ Number ] -> this
//   scale :: [ Int ] -> [ Number ] -> this
//   translate :: [ Int ] -> [ Number ] -> this
//   transform :: Matrix44 -> this
//   embed :: Number -> this
//   merge :: Number -> this
//   map :: ( Point -> Index -> Point ) -> Boolean -> this
//   extrude :: [ Number ] -> this
//   explode :: [ Number ] -> this
//   skeleton :: Int -> this
//   boundary : () -> this
//   prod :: ISEGeometry -> this
//   cut :: ISEGeometry -> this
//   fuse :: ISEGeometry -> this
//   common :: ISEGeometry -> this
//   complement :: ISEGeometry -> this
