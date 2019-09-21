let pg, connectSettings, modules;

pg = require( "pg" );
connectSettings = require( "./connectSettings.json" );

modules = {};
modules.db = pg.Pool( connectSettings );
modules.companies = new ( require( "./companies" ) )( modules );
modules.infoBlocks = new ( require( "./infoBlocks" ) )( modules );
modules.questions = new ( require( "./questions" ) )( modules );
modules.possibleAnswers = new ( require( "./possibleAnswers" ) )( modules );
modules.telegram = new ( require( "./telegram" ) )( modules );

module.exports = modules;
