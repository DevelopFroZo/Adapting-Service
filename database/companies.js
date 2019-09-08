let crypto;

crypto = require( "crypto" );

class Companies{
  constructor( db ){
    this.db = db;
  }

  authorize( email, password ){
    return new Promise( ( res, rej ) => this.db.query(
      "select password, token " +
      "from companies " +
      "where email = $1",
      [ email ]
    )
    .then( data => {
      if( data.rowCount === 0 ){
        rej( `Email "${email}" не найден` );

        return;
      }

      let password_;

      password_ = data.rows[0].password.split( ";" );
      password = crypto.createHash( "sha1" ).update( `${password}${password_[1]}` ).digest( "hex" );

      if( password !== password_[0] ){
        rej( "Неверный пароль" );

        return;
      }

      if( data.rows[0].token !== null ) res( {
        isSuccess : true,
        token : data.rows[0].token
      } );
      else{
        let token;

        token = crypto.createHash( "sha1" ).update( `${email}${password}${( new Date() ).toString()}` ).digest( "hex" );
        this.db.query(
          "update companies " +
          "set token = $1 " +
          "where email = $2",
          [ token, email ]
        )
        .then( () => res( {
          isSuccess : true,
          token
        } ) )
        .catch( rej );
      }
    } )
    .catch( rej ) );
  }

  isTokenValid( token ){
    return new Promise( ( res, rej ) => this.db.query(
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

function index( db ){
  return new Companies( db );
}

module.exports = index;
