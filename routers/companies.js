let express;

express = require( "express" );

function authorizeHandler( req, res ){
  req.db
    .companiesAuthorize( req.body.email, req.body.password )
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
