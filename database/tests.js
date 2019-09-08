class Tests{
  constructor( db, companies ){
    this.db = db;
    this.companies = companies;
  }
}

function index( db, companies ){
  return new Tests( db, companies );
}

module.exports = index;
