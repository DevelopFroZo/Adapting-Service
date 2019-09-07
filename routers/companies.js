let express;

express = require( "express" );

function authorizeHandler( req, res ){
  req.companies
    .authorize( req.body.email, req.body.password )
    .then( data => res.send( data ) )
    .catch( error => res.send( error ) );
}

function index( companies ){
  let router;

  router = express.Router();

  router.post( "*", ( req, res, next ) => {
    req.companies = companies;
    next();
  } );
  router.post( "/authorize", authorizeHandler );

  return router;
}

module.exports = index;
