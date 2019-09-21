let express;

express = require( "express" );

async function authorizeHandler( req, res ){
  res.send( await req.db.companies.authorize(
    req.body.email, req.body.password
  ) );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/authorize", authorizeHandler );

  return router;
}

module.exports = index();
