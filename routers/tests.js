let express, isTokenExists;

express = require( "express" );
isTokenExists = require( "./support/isTokenExists" );

function addHandler( req, res ){
  req.db.tests.add( req.token, req.body )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( isTokenExists );
  router.post( "/add", addHandler );

  return router;
}

module.exports = index();
