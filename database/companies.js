/*
 *  Error codes:
 *   0 -- неверный логин или email
 *   1 -- неверный пароль
 *   2 -- ошибка авторизации (неверный токен)
 *   3 -- компания уже авторизована
 *   4 -- неверные поля
 */

let crypto, salt;

crypto = require( "crypto" );
salt = require( "./support/salt.js" );

class Companies{
  constructor( modules ){
    this.modules = modules;
  }

  getHashedPassword( password, salt_ ){
    if( salt_ === undefined ) salt_ = salt( 5 );

    password = crypto.createHash( "sha256" ).update( `${password}${salt_}` ).digest( "hex" );

    return [ password, salt_ ];
  }

  async register( name, email, password, city, login ){
    let data;

    if( login === undefined ) login = null;

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

    password = this.getHashedPassword( password ).join( ";" );

    await this.modules.db.query(
      "insert into companies( name, email, password, city, login ) " +
      "values( $1, $2, $3, $4, $5 )",
      [ name, email, password, city, login ]
    );

    return { isSuccess : true };
  }

  async authorize( emailOrLogin, password ){
    let data, password_, token;

    emailOrLogin = emailOrLogin.toLowerCase( emailOrLogin );

    data = await this.modules.db.query(
      "select email, password, token " +
      "from companies " +
      "where lower( email ) = $1 or lower( login ) = $1",
      [ emailOrLogin ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : `Email or login "${emailOrLogin}" not found`
    };

    data = data.rows[0];
    password_ = data.password.split( ";" );
    password = this.getHashedPassword( password, password_[1] )[0];

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

  async getInfo( companyId ){
    let info;

    info = ( await this.modules.db.query(
      "select id, name, email, city, login " +
      "from companies " +
      "where id = $1",
      [ companyId ]
    ) ).rows[0];

    return {
      isSuccess : true,
      code : -2,
      info
    };
  }
}

module.exports = Companies;
