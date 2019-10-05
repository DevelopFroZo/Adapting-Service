let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function addHandler( req, res ){
  res.send( await req.db.questions.add(
    req.companyId, req.body.infoBlockId,
    req.body.description, req.body.type,
    req.body.time
  ) );
}

async function editHandler( req, res ){
  res.send( await req.db.questions.edit(
    req.companyId, req.body.questionId,
    req.body.fields
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/add", addHandler );
  router.post( "/edit", editHandler );

  return router;
}

module.exports = index();
