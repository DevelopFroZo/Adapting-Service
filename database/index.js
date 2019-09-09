let pg, connectSettings, modules;

pg = require( "pg" );
connectSettings = require( "./connectSettings.json" );

modules = {};
modules.db = pg.Pool( connectSettings );
modules.companies = require( "./companies" )( modules );
modules.tests = require( "./tests" )( modules );
modules.questions = require( "./questions" )( modules );
modules.possibleAnswers = require( "./possibleAnswers" )( modules );

module.exports = modules;
