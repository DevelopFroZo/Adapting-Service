let express;

express = require( "express" );

function authorizeHandler( req, res ){
  req.db.telegram.authorize(
    req.body.companyName, req.body.key, req.body.telegramId
  )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function getInfoBlockHandler( req, res ){
  req.db.telegram.getInfoBlock(
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

  return router;
}

module.exports = index();
