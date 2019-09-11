let BaseDatabaseClass, crypto;

BaseDatabaseClass = require( "./baseDatabaseClass" );
crypto = require( "crypto" );

class Companies extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Companies" );
  }

  authorize( authData ){
    let token;

    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select password, token " +
      "from companies " +
      "where email = $1",
      [ authData.email ]
    )
    .then( data => {
      let password;

      if( data.rowCount === 0 ) error( { error : `Email "${authData.email}" не найден` } );

      password = data.rows[0].password.split( ";" );
      authData.password = crypto.createHash( "sha1" ).update( `${authData.password}${password[1]}` ).digest( "hex" );

      if( authData.password !== password[0] ) error( { error : "Неверный пароль" } );

      if( data.rows[0].token !== null ){
        success( { token : data.rows[0].token } );

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
    .then( () => success( { token } ) )
    .catch( error => fatal( error, "authorize" ) ) );
  }

  isTokenValid( token ){
    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select id " +
      "from companies " +
      "where token = $1",
      [ token ]
    )
    .then( data => {
      if( data.rowCount === 0 ) error( { error : "Проблемы с авторизацией" } );
      else success();
    } )
    .catch( error => fatal( error, "isTokenValid" ) ) );
  }
}

module.exports = Companies;
