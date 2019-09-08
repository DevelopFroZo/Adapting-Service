let pg, connectSettings, db;
let companies;

pg = require( "pg" );
connectSettings = require( "./connectSettings.json" );
db = pg.Pool( connectSettings );

companies = require( "./companies" )( db );

module.exports = {
  companies,
  tests : require( "./tests" )( db, companies )
};
