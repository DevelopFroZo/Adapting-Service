let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function getHandler( req, res ){
  res.send( await req.db.tests.get(
    req.companyId, req.body.infoBlockId
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/get", getHandler );

  return router;
}

module.exports = index();
