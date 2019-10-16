let BaseDatabase, CodesGenerator;

CodesGenerator = require( "./support/codesGenerator" );
BaseDatabase = require( "./support/baseDatabase" );

class Codes extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Codes" );
  }

  async generate(){
    let state, fl, codesGenerator, codes, transaction;

    state = await super.query(
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

    transaction = await super.transaction();

    await transaction.query(
        "insert into codes( code ) " +
        `values ${codes.join( ", " )}`
      );

    if( !fl ) await transaction.query(
      "update lastcodestate " +
      "set state = $1",
      [ codesGenerator.state.join( "," ) ]
    );
    else await transaction.query(
      "insert into lastcodestate( state ) " +
      "values( $1 )",
      [ codesGenerator.state.join( "," ) ]
    );

    await transaction.end();

    return super.success( 11, codes[ Math.floor( Math.random() * codes.length ) ].slice( 2, 8 ) );
  }

  async getRandom(){
    let codes, code;

    codes = await super.query(
      "select code " +
      "from codes"
    );

    if( codes.rowCount === 0 ){
      code = await this.generate();

      if( !code.ok ) return code;

      return super.success( 11, code.data );
    }

    return super.success( 11, codes.rows[ Math.floor( Math.random() * codes.rows.length ) ].code );
  }
}

module.exports = Codes;
