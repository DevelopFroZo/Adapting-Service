let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function addHandler( req, res ){
  res.send( await req.db.infoBlocks.add(
    req.companyId, req.body.name,
    req.body.description
  ) );
}

async function deleteHandler( req, res ){
  res.send( await req.db.infoBlocks.delete(
    req.companyId, req.body.infoBlockId
  ) );
}

async function getAllHandler( req, res ){
  res.send( await req.db.infoBlocks.getAll(
    req.companyId
  ) );
}

async function editHandler( req, res ){
  res.send( await req.db.infoBlocks.edit(
    req.companyId, req.body.infoBlockId,
    req.body.fields
  ) );
}

async function subscribeHandler( req, res ){
  res.send( await req.db.infoBlocks.subscribe(
    req.companyId, req.body.infoBlockId,
    req.body.workerIds
  ) );
}

async function unsubscribeHandler( req, res ){
  res.send( await req.db.infoBlocks.unsubscribe(
    req.companyId, req.body.infoBlockId,
    req.body.workerIds
  ) );
}

async function getSubscribersHandler( req, res ){
  res.send( await req.db.infoBlocks.getSubscribers(
    req.companyId, req.body.infoBlockId
  ) );
}

async function getPassedOrCheckedTestsHandler( req, res ){
  res.send( await req.db.infoBlocks.getPassedOrCheckedTests(
    req.companyId
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/add", addHandler );
  router.post( "/delete", deleteHandler );
  router.post( "/getAll", getAllHandler );
  router.post( "/edit", editHandler );
  router.post( "/subscribe", subscribeHandler );
  router.post( "/unsubscribe", unsubscribeHandler );
  router.post( "/getSubscribers", getSubscribersHandler );
  router.post( "/getPassedOrCheckedTests", getPassedOrCheckedTestsHandler );

  return router;
}

module.exports = index();
