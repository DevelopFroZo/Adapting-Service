let express;

express = require( "express" );

async function deleteFromTablesHandler( req, res ){
  res.send( await req.db.secret.deleteFromTables() );
}

async function dropTablesHandler( req, res ){
  res.send( await req.db.secret.dropTables() );
}

async function createTablesHandler( req, res ){
  res.send( await req.db.secret.createTables() );
}

async function rebuildHandler( req, res ){
  res.send( await req.db.secret.rebuild() );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/deleteFromTables", deleteFromTablesHandler );
  router.post( "/dropTables", dropTablesHandler );
  router.post( "/createTables", createTablesHandler );
  router.post( "/rebuild", rebuildHandler );

  return router;
}

module.exports = index();
