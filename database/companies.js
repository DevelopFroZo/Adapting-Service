let BaseDatabaseClass, crypto;

BaseDatabaseClass = require( "./baseDatabaseClass" );
crypto = require( "crypto" );

class Companies extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Companies" );
  }

  authorize( email, password ){
    let token;

    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select password, token " +
      "from companies " +
      "where email = $1",
      [ email ]
    )
    .then( data => {
      let password_;

      if( data.rowCount === 0 ) error( { error : `Email "${email}" не найден` } );

      password_ = data.rows[0].password.split( ";" );
      password = crypto.createHash( "sha1" ).update( `${password}${password_[1]}` ).digest( "hex" );

      if( password !== password_[0] ) error( { error : "Неверный пароль" } );

      if( data.rows[0].token !== null ){
        success( { token : data.rows[0].token } );

        return;
      }

      token = crypto.createHash( "sha1" ).update( `${email}${password}${( new Date() ).toString()}` ).digest( "hex" );

      return this.modules.db.query(
        "update companies " +
        "set token = $1 " +
        "where email = $2",
        [ token, email ]
      );
    } )
    .then( () => success( { token } ) )
    .catch( error => fatal( error, "authorize" ) ) );
  }

  isTokenValid( token, isCalledFromProgram ){
    if( isCalledFromProgram === true )
      return super.promise( success => success() );

    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select id " +
      "from companies " +
      "where token = $1",
      [ token ]
    )
    .then( data => {
      if( data.rowCount === 0 ) error( { error : "Ошибка авторизации" } );

      success();
    } )
    .catch( error => fatal( error, "isTokenValid" ) ) );
  }
}

module.exports = Companies;
