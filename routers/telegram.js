let express;

express = require( "express" );

async function authorizeHandler( req, res ){
  res.send( await req.db.telegram.authorize(
    req.body.companyName, req.body.key, req.body.telegramId
  ) );
}

async function getInfoBlockHandler( req, res ){
  res.send( await req.db.telegram.getInfoBlock(
    req.body.telegramId
  ) );
}

async function getQuestionHandler( req, res ){
  res.send( await req.db.telegram.getQuestion(
    req.body.telegramId
  ) );
}

async function acceptQuestionHandler( req, res ){
  res.send( await req.db.telegram.acceptQuestion(
    req.body.telegramId, req.body.time
  ) );
}

async function sendAnswerHandler( req, res ){
  res.send( await req.db.telegram.sendAnswer(
    req.body.telegramId, req.body.answer, req.body.time
  ) );
}

async function getStatusHandler( req, res ){
  res.send( await req.db.telegram.getStatus(
    req.body.telegramId
  ) );
}

async function getWorkersWithStatus3Handler( req, res ){
  res.send( await req.db.telegram.getWorkersWithStatus3() );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/authorize", authorizeHandler );
  router.post( "/getInfoBlock", getInfoBlockHandler );
  router.post( "/getQuestion", getQuestionHandler );
  router.post( "/acceptQuestion", acceptQuestionHandler );
  router.post( "/sendAnswer", sendAnswerHandler );
  router.post( "/getStatus", getStatusHandler );
  router.post( "/getWorkersWithStatus3", getWorkersWithStatus3Handler );

  return router;
}

module.exports = index();