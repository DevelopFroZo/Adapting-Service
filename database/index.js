let pg, connectSettings, db, modules;

pg = require( "pg" );
connectSettings = require( "./connectSettings.json" );
db = pg.Pool( connectSettings );
modules = {
  companies : require( "./companies" )( db )
};

module.exports = modules;
