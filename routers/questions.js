let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function addHandler( req, res ){
  res.send( await req.db.questions.add(
    req.companyId, req.body.infoBlockId,
    req.body.name, req.body.description,
    req.body.type, req.body.time
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/add", addHandler );

  return router;
}

module.exports = index();
