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

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/add", addHandler );
  router.post( "/delete", deleteHandler );
  router.post( "/getAll", getAllHandler );
  router.post( "/edit", editHandler );

  return router;
}

module.exports = index();
