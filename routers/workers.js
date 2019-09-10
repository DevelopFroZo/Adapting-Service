let express;

express = require( "express" );

function authorizeHandler( req, res ){
  req.db.workers.authorize( req.body )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/authorize", authorizeHandler );

  return router;
}

module.exports = index();
