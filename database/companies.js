let crypto;

crypto = require( "crypto" );

class Companies{
  constructor( modules ){
    this.modules = modules;
  }

  async authorize( email, password ){
    let data, token, password_;

    email = email.toLowerCase( email );

    data = await this.modules.db.query(
      "select password, token " +
      "from companies " +
      "where email = $1",
      [ email ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      error : `Email "${email}" не найден`
    };

    password_ = data.rows[0].password.split( ";" );
    password = crypto.createHash( "sha256" ).update( `${password}${password_[1]}` ).digest( "hex" );

    if( password !== password_[0] ) return {
      isSuccess : false,
      error : "Неверный пароль"
    };

    if( data.rows[0].token !== null ) return {
      isSuccess : true,
      token : data.rows[0].token
    };

    token = crypto.createHash( "sha256" ).update( `${email}${password}${( new Date() ).toString()}` ).digest( "hex" );

    await this.modules.db.query(
      "update companies " +
      "set token = $1 " +
      "where email = $2",
      [ token, email ]
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
      error : "Ошибка авторизации"
    };

    return {
      isSuccess : true,
      id : data.rows[0].id
    };
  }
}

module.exports = Companies;
