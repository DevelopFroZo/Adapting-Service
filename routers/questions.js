let express, isTokenExists;

express = require( "express" );
isTokenExists = require( "./support/isTokenExists" );

async function addHandler( req, res ){
  res.send( await req.db.questions.add(
    req.token,
    req.body.infoBlockId,
    req.body.name,
    req.body.description,
    req.body.type,
    req.body.time
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
