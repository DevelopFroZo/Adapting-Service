let express;

express = require( "express" );

async function authorizeHandler( req, res ){
  res.send( await req.db.telegram.authorize(
    req.body.companyName, req.body.key, req.body.telegramId
  ) );
}

function getInfoBlockHandler( req, res ){
  req.db.telegram.getInfoBlock(
    req.body.telegramId
  )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function getQuestionHandler( req, res ){
  req.db.telegram.getQuestion(
    req.body.telegramId
  )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function acceptQuestionHandler( req, res ){
  req.db.telegram.acceptQuestion(
    req.body.telegramId
  )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/authorize", authorizeHandler );
  router.post( "/getInfoBlock", getInfoBlockHandler );
  router.post( "/getQuestion", getQuestionHandler );
  router.post( "/acceptQuestion", acceptQuestionHandler );

  return router;
}

module.exports = index();
