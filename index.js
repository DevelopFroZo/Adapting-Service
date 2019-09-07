let express, bodyParser, db, routers;

express = require( "express" );
bodyParser = require( "body-parser" );
db = require( "./database/index" );
routers = require( "./routers/index" )( db );

function index(){
  let server, siteFolder, PORT;

  server = express();
  siteFolder = process.argv[2] ? "Testing/" : "public/";
  PORT = 80;

  // Settings
  server.use( bodyParser() );

  // Routers
  server.use( "/companies", routers.companies );

  // Settings
  server.use( express.static( siteFolder ) );

  // Run server
  server.listen( PORT, () => {
    console.log( `Server listened on ${PORT} port` );
  } );
}

index();
