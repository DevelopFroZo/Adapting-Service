let express, isTokenExists;

express = require( "express" );
isTokenExists = require( "./support/isTokenExists" );

async function addHandler( req, res ){
  res.send( await req.db.possibleAnswers.add(
    req.token,
    req.body.questionId,
    req.body.description,
    req.body.isRight,
    req.body.number
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( isTokenExists );
  router.post( "/add", addHandler );

  return router;
}

module.exports = index();
