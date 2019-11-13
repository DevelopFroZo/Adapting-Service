let BaseDatabase, crypto, salt;

BaseDatabase = require( "./support/baseDatabase" );
crypto = require( "crypto" );
salt = require( "./support/salt.js" );

class Companies extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Companies" );
  }

  getHashedPassword( password, salt_ ){
    if( salt_ === undefined ) salt_ = salt( 5 );

    password = crypto.createHash( "sha256" ).update( `${password}${salt_}` ).digest( "hex" );

    return [ password, salt_ ];
  }

  async register( name, email, password, city, login ){
    let data;

    email = email.toLowerCase();
    if( login === undefined ) login = null;

    data = await super.query(
      "select 1 " +
      "from companies " +
      "where" +
      "   lower( name ) = lower( $1 ) or" +
      "   email = $2 or" +
      "   lower( login ) = lower( $3 )",
      [ name, email, login ]
    );

    if( data.rowCount === 1 ) return super.error( 2 );

    password = this.getHashedPassword( password ).join( ";" );

    await super.query(
      "insert into companies( name, email, password, city, login ) " +
      "values( $1, $2, $3, $4, $5 )",
      [ name, email, password, city, login ]
    );

    return super.success( 1 );
  }

  async authorize( emailOrLogin, password ){
    let data, password_, token;

    emailOrLogin = emailOrLogin.toLowerCase( emailOrLogin );

    data = await super.query(
      "select email, password, token " +
      "from companies " +
      "where" +
      "   email = $1 or" +
      "   lower( login ) = $1",
      [ emailOrLogin ]
    );

    if( data.rowCount === 0 ) return super.error( 3 );

    data = data.rows[0];
    password_ = data.password.split( ";" );
    password = this.getHashedPassword( password, password_[1] )[0];

    if( password !== password_[0] ) return super.error( 4 );
    if( data.token !== null ) return super.success( 2, data.token );

    token = crypto.createHash( "sha256" ).update( `${data.email}${password}${( new Date() ).toString()}` ).digest( "hex" );

    await super.query(
      "update companies " +
      "set token = $1 " +
      "where email = $2",
      [ token, data.email ]
    );

    return super.success( 2, token );
  }

  async getCompanyIdByToken( token ){
    if( typeof( token ) !== "string" || token === "" ) return null;

    let id;

    id = await super.query(
      "select id " +
      "from companies " +
      "where token = $1",
      [ token ]
    );

    if( id.rowCount === 0 ) return null;
    else return id.rows[0].id;
  }

  async edit( companyId, password, fields ){
    let password_, fields_, fills, count;

    password_ = ( await super.query(
      "select password " +
      "from companies " +
      "where id = $1",
      [ companyId ]
    ) ).rows[0].password;
    password_ = password_.split( ";" );
    password = this.getHashedPassword( password, password_[1] )[0];

    if( password !== password_[0] ) return super.error( 4 );

    fields_ = [];
    fills = [];
    count = 1;

    for( let field in fields ) if(
      [ "name", "email", "password", "city", "login" ].indexOf( field ) > -1
    ){
      if( field === "password" ) fields[ field ] = this.getHashedPassword( fields[ field ] ).join( ";" );

      fields_.push( `${field} = $${count}` );
      fills.push( fields[ field ] );
      count++;
    }

    if( fields_.length === 0 ) return super.error( 5 );

    fields_ = fields_.join( ", " );
    fills.push( companyId );

    await super.query(
      "update companies " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return super.success( 3 );
  }

  async getInfo( companyId ){
    let info;

    info = ( await super.query(
      "select id, name, email, city, login " +
      "from companies " +
      "where id = $1",
      [ companyId ]
    ) ).rows[0];

    return super.success( 4, info );
  }
}

module.exports = Companies;
