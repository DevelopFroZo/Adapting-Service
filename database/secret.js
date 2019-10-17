let fs, BaseDatabase;

fs = require( "fs" );
BaseDatabase = require( "./support/baseDatabase" );

class Secret extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Secret" );
  }

  async queriesChain( path, splitter ){
    let queries, errors;

    queries = fs.readFileSync( __dirname + `/queries/${path}.sql`, "utf8" );
    queries = queries.split( splitter );
    errors = [];

    for( let i = 0; i < queries.length; ){
      while( queries[i].indexOf( "\n" ) > -1 ) queries[i] = queries[i].replace( "\n", "" );
      while( queries[i].indexOf( "\r" ) > -1 ) queries[i] = queries[i].replace( "\r", "" );
      while( queries[i].indexOf( ";" ) > -1 ) queries[i] = queries[i].replace( ";", "" );
      while( queries[i].indexOf( "  " ) > -1 ) queries[i] = queries[i].replace( "  ", " " );

      if( queries[i] === "" ) queries.splice( i, 1 );
      else{
        try{
          await super.query( queries[i] );
        }
        catch( error ){
          errors.push( queries[i] );
        }

        i++;
      }
    }

    return errors;
  }

  async deleteFromTables(){
    return super.success( 0, await this.queriesChain( "delete", "\n" ) );
  }

  async dropTables(){
    return super.success( 0, await this.queriesChain( "drop", "\n" ) );
  }

  async createTables(){
    return super.success( 0, await this.queriesChain( "create", "-- @" ) );
  }

  async rebuild(){
    let errors;

    errors = [];

    errors.concat( ( await this.deleteFromTables() ).data );
    errors.concat( ( await this.dropTables() ).data );
    errors.concat( ( await this.createTables() ).data );

    return super.success( 0, errors );
  }

  async fill(){
    return super.success( 0, await this.queriesChain( "fill", "-- @" ) );
  }

  async refill(){
    let errors;

    errors = [];
    errors.concat( ( await this.deleteFromTables() ).data );
    errors.concat( ( await this.fill() ).data );

    return super.success( 0, errors );
  }

  async rebuildAndFill(){
    let errors;

    errors = [];
    errors.concat( ( await this.rebuild() ).data );
    errors.concat( ( await this.fill() ).data );

    return super.success( 0, errors );
  }
}

module.exports = Secret;
