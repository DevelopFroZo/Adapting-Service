let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function addHandler( req, res ){
  res.send( await req.db.possibleAnswers.add(
    req.companyId, req.body.questionId,
    req.body.description, req.body.isRight
  ) );
}

async function deleteHandler( req, res ){
  res.send( await req.db.possibleAnswers.delete(
    req.companyId, req.body.possibleAnswerId
  ) );
}

async function editHandler( req, res ){
  res.send( await req.db.possibleAnswers.edit(
    req.companyId, req.body.possibleAnswerId,
    req.body.fields
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/add", addHandler );
  router.post( "/delete", deleteHandler );
  router.post( "/edit", editHandler );

  return router;
}

module.exports = index();
