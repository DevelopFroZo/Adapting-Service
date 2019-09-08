let express;

express = require( "express" );

function addHandler( req, res ){
  console.log( "?" );
  res.send( { q : "w" } );
}

function index( tests ){
  let router;

  router = express.Router();

  router.post( "*", ( req, res, next ) => {
    req.tests = tests;
    next();
  } );
  router.post( "/add", addHandler );

  return router;
}

module.exports = index;
