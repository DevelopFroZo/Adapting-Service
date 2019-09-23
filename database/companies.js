/*
 *  Error codes:
 *   0 -- неверный логин или email
 *   1 -- неверный пароль
 *   2 -- ошибка авторизации (неверный токен)
 */

let crypto;

crypto = require( "crypto" );

class Companies{
  constructor( modules ){
    this.modules = modules;
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

  async isTokenValid( token ){
    let data;

    data = await this.modules.db.query(
      "select id " +
      "from companies " +
      "where token = $1",
      [ token ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 2,
      error : "Authorize failed"
    };

    return {
      isSuccess : true,
      id : data.rows[0].id
    };
  }
}

module.exports = Companies;
