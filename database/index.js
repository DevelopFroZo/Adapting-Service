let pg, connectSettings, codes;

pg = require( "pg" );
connectSettings = require( "./support/connectSettings" );
codes = require( "./codes/index" );

function index(){
  let modules;

  modules = {};
  modules.db = pg.Pool( connectSettings.local );
  modules.companies = new ( require( "./companies" ) )( modules, codes.frontend );
  modules.infoBlocks = new ( require( "./infoBlocks" ) )( modules, codes.frontend );
  modules.questions = new ( require( "./questions" ) )( modules, codes.frontend );
  modules.possibleAnswers = new ( require( "./possibleAnswers" ) )( modules, codes.frontend );
  modules.telegram = new ( require( "./telegram" ) )( modules, codes.telegram );
  modules.tests = new ( require( "./tests" ) )( modules, codes.frontend );
  modules.workers = new ( require( "./workers" ) )( modules, codes.frontend );
  modules.codes = new ( require( "./codes" ) )( modules, codes.frontend );

  return modules;
}

module.exports = index();
