let Transaction;

Transaction = require( "./transaction.js" );

class BaseDatabase{
  constructor( modules, codes, path ){
    this.modules = modules;
    this.codes = codes;
    this.path = path;
  }

  async query( sql, data ){
    return await this.modules.db.query( sql, data );
  }

  async transaction( path ){
    return new Transaction( await this.modules.db, `${this.path}.${path}` );
  }

  success( code, data ){
    if( data === undefined ) data = null;
    if( code === undefined ) code = 0;

    return {
      ok : true,
      code,
      message : this.codes.successes[ code ],
      data
    };
  }

  error( code ){
    if( code === undefined ) code = 0;

    return {
      ok : false,
      code,
      message : this.codes.errors[ code ]
    };
  }
}

module.exports = BaseDatabase;
