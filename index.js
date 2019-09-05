let express;//, bodyParser, db, routers;

express = require( "express" );
//bodyParser = require( "body-parser" );

//db = require( "./database/index.js" );
/*routers = {
  users : require( "./routers/users" )( db.users )
};*/

function index(){
  let server, siteFolder, PORT;

  server = express();
  siteFolder = "public/";
  PORT = 80;

  // Settings
  //server.use( bodyParser() );

  // Routers
  //server.use( "/user", routers.users );

  // Settings
  server.use( express.static( siteFolder ) );

  // Run server
  server.listen( PORT, () => {
    console.log( `Server listened on ${PORT} port` );
  } );
}

index();
