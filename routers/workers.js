let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function createHandler( req, res ){
  res.send( await req.db.workers.create(
    req.companyId, req.body.name
  ) );
}

async function deleteHandler( req, res ){
  res.send( await req.db.workers.delete(
    req.companyId, req.body.workerId
  ) );
}

async function getAllHandler( req, res ){
  res.send( await req.db.workers.getAll(
    req.companyId
  ) );
}

async function subscribeHandler( req, res ){
  res.send( await req.db.workers.subscribe(
    req.companyId, req.body.workerId,
    req.body.infoBlockIds
  ) );
}

async function unsubscribeHandler( req, res ){
  res.send( await req.db.workers.unsubscribe(
    req.companyId, req.body.workerId,
    req.body.infoBlockIds
  ) );
}

async function getSubscriptionsHandler( req, res ){
  res.send( await req.db.workers.getSubscriptions(
    req.companyId, req.body.workerId
  ) );
}

async function getAnswersHandler( req, res ){
  res.send( await req.db.workers.getAnswers(
    req.companyId, req.body.workerId,
    req.body.infoBlockId
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/create", createHandler );
  router.post( "/delete", deleteHandler );
  router.post( "/getAll", getAllHandler );
  router.post( "/subscribe", subscribeHandler );
  router.post( "/unsubscribe", unsubscribeHandler );
  router.post( "/getSubscriptions", getSubscriptionsHandler );
  router.post( "/getAnswers", getAnswersHandler );

  return router;
}

module.exports = index();
