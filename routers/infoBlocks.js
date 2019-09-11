let express;

express = require( "express" );

function getForWorkerHandler( req, res ){
  req.db.infoBlocks.getForWorker(
    req.body
  )
  .then( data => res.send( data ) )
  .catch( error => res.send( error ) );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/getForWorker", getForWorkerHandler );

  return router;
}

module.exports = index();
