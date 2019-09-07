let modules;

function index( db ){
  return {
    companies : require( "./companies" )( db.companies )
  }
}

module.exports = index;
