let express, needAuthorize;

express = require( "express" );
needAuthorize = require( "./support/needAuthorize" );

async function registerHandler( req, res ){
  res.send( await req.db.companies.register(
    req.body.name, req.body.email, req.body.password,
    req.body.city, req.body.login
  ) );
}

async function authorizeHandler( req, res ){
  res.send( await req.db.companies.authorize(
    req.body.email, req.body.password
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.use( needAuthorize );
  router.post( "/register", registerHandler );
  router.post( "/authorize", authorizeHandler );

  return router;
}

module.exports = index();
