let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function getAllHandler( req, res ){
  res.send( await req.db.workers.getAll(
    req.companyId
  ) );
}

async function getSubscribersHandler( req, res ){
  res.send( await req.db.workers.getSubscribers(
    req.companyId, req.body.infoBlockId
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/getAll", getAllHandler );
  router.post( "/getSubscribers", getSubscribersHandler );

  return router;
}

module.exports = index();
