let express;

express = require( "express" );

function authorizeHandler( req, res ){
  req.db.telegram.authorize(
    req.body.companyName, req.body.key, req.body.telegramId
  )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function getBlockHandler( req, res ){
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
  router.post( "/getInfoBlock", getBlockHandler );

  return router;
}

module.exports = index();
