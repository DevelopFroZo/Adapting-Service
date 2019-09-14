let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Telegram extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Telegram" );
  }

  authorize( companyName, key, telegramId ){
    let workerId;

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
      if( data.rowCount === 1 ) error( { error : "Вы уже авторизованы" } );

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
        "where telegramid = $1 and workerid != $2",
        [ telegramId, workerId ]
      ) )
      .then( () => client.query( "commit" ).then( success2 ) )
      .catch( error => client.query( "rollback" ).then( () => fatal2( error, "authorize (transaction)" ) ) ) ) );
    } )
    .then( () => this.modules.db.query(
      "select name " +
      "from workers " +
      "where id = $1",
      [ workerId ]
    ) )
    .then( data => success( { name : data.rows[0].name } ) )
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
}

module.exports = Telegram;
