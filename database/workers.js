let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Workers extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Workers" );
  }

  authorize( authData ){
    let id;

    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select q.id, q.key, q.telegramid " +
      "from workers as q, companies as w " +
      "where q.companyid = w.id and q.key = $1 and w.name = $2",
      [ authData.key, authData.companyName ]
    )
    .then( data => {
      if( data.rowCount === 0 ) error( { error : "Введены неверные данные" } );
      if( data.rows[0].telegramid !== null ) error( { error : "Вы уже зарегистрированы" } );

      id = data.rows[0].id;

      return this.modules.db.query(
        "update workers " +
        "set telegramid = $1 " +
        "where id = $2",
        [ authData.telegramId, id ]
      );
    } )
    .then( data => this.modules.db.query(
      "update workers " +
      "set isoncompany = false " +
      "where telegramid = $1",
      [ authData.telegramId ]
    ) )
    .then( data => this.modules.db.query(
      "update workers " +
      "set isoncompany = true " +
      "where id = $1 " +
      "returning name",
      [ id ]
    ) )
    .then( data => success( { name : data.rows[0].name } ) )
    .catch( error => fatal( error, "authorize" ) ) );
  }

  isTelegramIdValid( authData ){
    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select id " +
      "from workers " +
      "where telegramid = $1",
      [ authData.telegramId ]
    )
    .then( data => {
      if( data.rowCount === 0 ) error( { error : "Ошибка авторизации" } );

      success();
    } )
    .catch( error => fatal( error, "isTelegramIdValid" ) ) );
  }
}

module.exports = Workers;
