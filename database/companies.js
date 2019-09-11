let crypto;

crypto = require( "crypto" );

class Companies{
  constructor( modules ){
    this.modules = modules;
  }

  authorize( authData ){
    let token;

    return new Promise( ( res, rej ) => this.modules.db.query(
      "select password, token " +
      "from companies " +
      "where email = $1",
      [ authData.email ]
    )
    .then( data => {
      if( data.rowCount === 0 ) rej( `Email "${authData.email}" не найден` );

      return data;
    } )
    .then( data => {
      let password;

      password = data.rows[0].password.split( ";" );
      authData.password = crypto.createHash( "sha1" ).update( `${authData.password}${password[1]}` ).digest( "hex" );

      if( authData.password !== password[0] ) rej( "Неверный пароль" );

      return data;
    } )
    .then( data => {
      if( data.rows[0].token !== null ){
        res( {
          isSuccess : true,
          token : data.rows[0].token
        } );

        return;
      }

      token = crypto.createHash( "sha1" ).update( `${authData.email}${authData.password}${( new Date() ).toString()}` ).digest( "hex" );

      return this.modules.db.query(
        "update companies " +
        "set token = $1 " +
        "where email = $2",
        [ token, authData.email ]
      );
    } )
    .then( () => res( {
      isSuccess : true,
      token
    } ) )
    .catch( rej ) );
  }

  isTokenValid( token ){
    return new Promise( ( res, rej ) => this.modules.db.query(
      "select id " +
      "from companies " +
      "where token = $1",
      [ token ]
    )
    .then( data => {
      if( data.rowCount === 0 ) res( false );
      else res( true );
    } )
    .catch( rej ) );
  }
}

module.exports = Companies;