let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function getAllHandler( req, res ){
  res.send( await req.db.workers.getAll(
    req.companyId
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/getAll", getAllHandler );

  return router;
}

module.exports = index();
