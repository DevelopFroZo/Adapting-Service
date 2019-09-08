let pg, crypto, connectSettings;

pg = require( "pg" );
crypto = require( "crypto" );

connectSettings = require( "./connectSettings.json" );

class Db{
  constructor(){
    this.db = pg.Pool( connectSettings );
  }

  companiesAuthorize( email, password ){
    return new Promise( ( res, rej ) => this.db.query(
      "select password, token " +
      "from companies " +
      "where email = $1",
      [ email ]
    )
    .then( data => {
      if( data.rowCount === 0 ) rej( `Email "${email}" не найден` );

      return data;
    } )
    .then( data => {
      let password_;

      password_ = data.rows[0].password.split( ";" );
      password = crypto.createHash( "sha1" ).update( `${password}${password_[1]}` ).digest( "hex" );

      if( password !== password_[0] ) rej( "Неверный пароль" );

      return data;
    } )
    .then( data => {
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

  companiesIsTokenValid( token ){
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

  testsAdd( token, testData ){
    return new Promise( ( res, rej ) => this
      .companiesIsTokenValid( token )
      .then( data => {
        if( !data ){
          res( {
            isSuccess : false,
            message : "Пользователь не авторизован"
          } );

          return;
        }

        return new Promise( ( res2, rej2 ) => this.db.query(
          "insert into tests( infoblockid, name, description ) " +
          "values( $1, $2, $3 )",
          [ 1, testData.test.name, testData.test.description ]
        )
        .then( res2 )
        .catch( rej2 ) );
      } )
      .then( () => res( { o : "k" } ) )
      .catch( rej ) );
  }
}

module.exports = new Db();
