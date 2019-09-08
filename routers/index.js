function index( db ){
  return {
    companies : require( "./companies" )( db.companies ),
    tests : require( "./tests" )( db.tests )
  }
}

module.exports = index;
