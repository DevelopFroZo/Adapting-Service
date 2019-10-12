let CodesGenerator;

CodesGenerator = require( "./support/codesGenerator.js" );

class Codes{
  constructor( modules ){
    this.modules = modules;
  }

  async generate(){
    let state, fl, codesGenerator, codes, client;

    state = await this.modules.db.query(
      "select state " +
      "from lastcodestate"
    );
    fl = false;

    if( state.rowCount === 0 ){
      state = "0,0,0,0,0,0";
      fl = true;
    }
    else state = state.rows[0].state;

    codesGenerator = new CodesGenerator( state );
    codes = [];

    for( let i = 0; i < 10000; i++ )
      codes.push( `('${codesGenerator.next()}')` );

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      await client.query(
        "insert into codes( code ) " +
        `values ${codes.join( ", " )}`
      );

      if( !fl ) await client.query(
        "update lastcodestate " +
        "set state = $1",
        [ codesGenerator.state.join( "," ) ]
      );
      else await client.query(
        "insert into lastcodestate( state ) " +
        "values( $1 )",
        [ codesGenerator.state.join( "," ) ]
      );

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        code : codes[ Math.floor( Math.random() * codes.length ) ].slice( 2, 8 )
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Codes.generate)"
      };
    }
  }

  async getRandom(){
    let codes, code;

    codes = await this.modules.db.query(
      "select code " +
      "from codes"
    );

    if( codes.rowCount === 0 ){
      code = await this.generate();

      if( !code.isSuccess ) return code;

      return code.code;
    }

    return codes.rows[ Math.floor( Math.random() * codes.rows.length ) ].code;
  }
}

module.exports = Codes;
