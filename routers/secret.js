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

async function fillHandler( req, res ){
  res.send( await req.db.secret.fill() );
}

async function refillHandler( req, res ){
  res.send( await req.db.secret.refill() );
}

async function rebuildAndFillHandler( req, res ){
  res.send( await req.db.secret.rebuildAndFill() );
}

function index(){
  let router;

  router = express.Router();

  router.post( "/deleteFromTables", deleteFromTablesHandler );
  router.post( "/dropTables", dropTablesHandler );
  router.post( "/createTables", createTablesHandler );
  router.post( "/rebuild", rebuildHandler );
  router.post( "/fill", fillHandler );
  router.post( "/refill", refillHandler );
  router.post( "/rebuildAndFill", rebuildAndFillHandler );

  return router;
}

module.exports = index();
