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

async function deleteHandler( req, res ){
  res.send( await req.db.questions.delete(
    req.companyId, req.body.questionId
  ) );
}

async function editHandler( req, res ){
  res.send( await req.db.questions.edit(
    req.companyId, req.body.questionId,
    req.body.fields
  ) );
}

async function checkLongQuestionsHandler( req, res ){
  res.send( await req.db.questions.checkLongQuestions(
    req.companyId, req.body.infoBlockId,
    req.body.workerId, req.body.data
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/add", addHandler );
  router.post( "/delete", deleteHandler );
  router.post( "/edit", editHandler );
  router.post( "/checkLongQuestions", checkLongQuestionsHandler );

  return router;
}

module.exports = index();
