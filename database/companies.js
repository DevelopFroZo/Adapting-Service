/*
 *  Error codes:
 *   0 -- неверный логин или email
 *   1 -- неверный пароль
 *   2 -- ошибка авторизации (неверный токен)
 *   3 -- компания уже авторизована
 */

let crypto, salt;

crypto = require( "crypto" );
salt = require( "./support/salt.js" );

class Companies{
  constructor( modules ){
    this.modules = modules;
  }

  async register( name, email, password, city, login ){
    let data, salt_;

    name = name.toLowerCase();
    email = email.toLowerCase();

    if( login === undefined ) login = null;
    else login = login.toLowerCase();

    data = await this.modules.db.query(
      "select 1 " +
      "from companies " +
      "where name = $1 or email = $2 or login = $3",
      [ name, email, login ]
    );

    if( data.rowCount === 1 ) return {
      isSuccess : false,
      code : 3,
      message : "Company already authorized"
    };

    salt_ = salt( 5 );
    password = crypto.createHash( "sha256" ).update( `${password}${salt}` ).digest( "hex" );

    await this.modules.db.query(
      "insert into companies( name, email, password, city, login ) " +
      "values( $1, $2, $3, $4, $5 )",
      [ name, email, password, city, login ]
    );

    return { isSuccess : true };
  }

  async authorize( emailOrLogin, password ){
    let data, token, password_;

    emailOrLogin = emailOrLogin.toLowerCase( emailOrLogin );

    data = await this.modules.db.query(
      "select email, password, token " +
      "from companies " +
      "where email = $1 or login = $1",
      [ emailOrLogin ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : `Email or login "${emailOrLogin}" not found`
    };

    data = data.rows[0];
    password_ = data.password.split( ";" );
    password = crypto.createHash( "sha256" ).update( `${password}${password_[1]}` ).digest( "hex" );

    if( password !== password_[0] ) return {
      isSuccess : false,
      code : 1,
      message : "Invalid password"
    };

    if( data.token !== null ) return {
      isSuccess : true,
      token : data.token
    };

    token = crypto.createHash( "sha256" ).update( `${data.email}${password}${( new Date() ).toString()}` ).digest( "hex" );

    await this.modules.db.query(
      "update companies " +
      "set token = $1 " +
      "where email = $2",
      [ token, data.email ]
    );

    return {
      isSuccess : true,
      token
    };
  }

  async getCompanyIdByToken( token ){
    let id;

    if( typeof( token ) !== "string" ) return null;

    id = await this.modules.db.query(
      "select id " +
      "from companies " +
      "where token = $1",
      [ token ]
    );

    if( id.rowCount === 0 ) return null;
    else return id.rows[0].id;
  }
}

module.exports = Companies;
