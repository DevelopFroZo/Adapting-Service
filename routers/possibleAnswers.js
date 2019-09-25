let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function addHandler( req, res ){
  res.send( await req.db.possibleAnswers.add(
    req.companyId, req.body.questionId,
    req.body.description, req.body.isRight
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
