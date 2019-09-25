let express, isTokenExists;

express = require( "express" );
isTokenExists = require( "./support/isTokenExists" );

async function addHandler( req, res ){
  res.send( await req.db.infoBlocks.add(
    req.token,
    req.body.name,
    req.body.description
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( isTokenExists );
  router.post( "/add", addHandler );

  return router;
}

module.exports = index();
