let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Telegram extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Telegram" );
  }

  updateInfoBlockIndex( telegramId ){
    return super.promise( ( success, error, fatal ) => this.modules.db.connect( ( err, client ) => client.query(
      "begin"
    )
    .then( () => client.query(
      "update workersstates " +
      "set infoblocknumber = infoblocknumber + 1 " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    ) )
    .then( () => client.query(
      "update workersstates " +
      "set infoblockid = (" +
      "   select ib.id " +
      "   from infoblocks as ib, workersstates as ws " +
      "   where" +
      "     ws.telegramid = $1 and" +
      "     ws.isusing and" +
      "     ib.number >= ws.infoblocknumber " +
      "   order by ib.number " +
      "   limit 1" +
      ") " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    ) )
    .then( () => client.query( "commit" ).then( success ) )
    .catch( error => client.query( "rollback" ).then( () => fatal( error, "updateInfoBlockIndex (transaction)" ) ) ) ) );
  }

  authorize( companyName, key, telegramId ){
    let workerId, name;

    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select w.id " +
      "from workers as w, companies as c " +
      "where" +
      "   w.companyid = c.id and" +
      "   w.key = $1 and" +
      "   c.name = $2",
      [ key, companyName ]
    )
    .then( data => {
      if( data.rowCount === 0 ) error( { error : "Ошибка авторизации" } );

      workerId = data.rows[0].id;

      return this.modules.db.query(
        "select workerid " +
        "from workersstates " +
        "where workerid = $1",
        [ workerId ]
      );
    } )
    .then( data => {
      if( data.rowCount === 1 ) error( { error : "Вы уже авторизованы в этой компании" } );

      return super.promise( ( success2, error2, fatal2 ) => this.modules.db.connect( ( err, client ) => client.query(
        "begin"
      )
      .then( () => client.query(
        "insert into workersstates( workerid, telegramid, isusing ) " +
        "values( $1, $2, true )",
        [ workerId, telegramId ]
      ) )
      .then( () => client.query(
        "update workersstates " +
        "set isusing = false " +
        "where telegramid = $1 and not workerid = $2",
        [ telegramId, workerId ]
      ) )
      .then( () => this.modules.db.query(
        "select name " +
        "from workers " +
        "where id = $1",
        [ workerId ]
      ) )
      .then( data => client.query( "commit" ).then( () => success2( data ) ) )
      .catch( error => client.query( "rollback" ).then( () => fatal2( error, "authorize (transaction)" ) ) ) ) );
    } )
    .then( data => {
      name = data.rows[0].name;

      return this.updateInfoBlockIndex( telegramId );
    } )
    .then( () => success( { name } ) )
    .catch( error => fatal( error, "authorize" ) ) );
  }

  getStatus( telegramId ){
    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select status " +
      "from workersstates " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    )
    .then( data =>
      data.rowCount === 0 ?
      error( { error : "Ошибка авторизации" } ) :
      success( { status : data.rows[0].status } )
    )
    .catch( error => fatal( error, "getStatus" ) ) );
  }

  getInfoBlock( telegramId ){
    return super.promise( ( success, error, fatal ) => this.getStatus(
      telegramId
    )
    .then( status => {
      if( status > 1 ) error( { error : "Невозможно выполнить действие" } );

      return super.promise( ( success2, error2, fatal2 ) => this.modules.db.connect( ( err, client ) => client.query(
        "begin"
      )
      .then( () => client.query(
        "update workersstates " +
        "set status = 1 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      ) )
      .then( () => client.query(
        "select name, description " +
        "from infoblocks as ib, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   id = ws.infoblockid",
        [ telegramId ]
      ) )
      .then( data => client.query( "commit" ).then( () => success( data.rows[0] ) ) )
      .catch( error => client.query( "rollback" ).then( () => fatal( error, "getInfoBlock (transaction)" ) ) ) ) );
    } )
    .then( data => success( data ) )
    .catch( error => fatal( error, "getInfoBlock" ) ) );
  }
}

module.exports = Telegram;
