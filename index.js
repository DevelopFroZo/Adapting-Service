let express, bodyParser, cookieParser, db, routers;

express = require( "express" );
bodyParser = require( "body-parser" );
cookieParser = require( "cookie-parser" );

db = require( "./database/index" );
routers = require( "./routers/index" );

function index(){
  let server, siteFolder, PORT;

  server = express();
  siteFolder = process.argv[2] ? "Testing/" : "public/";
  PORT = 80;

  // Settings
  server.use( bodyParser() );
  server.use( cookieParser() );

  // Routers
  server.post( "*", ( req, res, next ) => {
    req.db = db;
    next();
  } );
  server.use( "/companies", routers.companies );
  server.use( "/tests", routers.tests );

  // Settings
  server.use( express.static( siteFolder ) );

  // Run server
  server.listen( PORT, () => {
    console.log( `Server listened on ${PORT} port` );
  } );
}

index();
