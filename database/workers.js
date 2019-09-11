let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Workers extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Workers" );
  }

  authorize( authData ){
    return super.promise( ( success, error, fatal ) => this.modules.db.query(
      "select q.id, q.key, q.telegramid " +
      "from workers as q, companies as w " +
      "where q.companyid = w.id and q.key = $1 and w.name = $2",
      [ authData.key, authData.companyName ]
    )
    .then( data => {
      if( data.rowCount === 0 ) error( { error : "Введены неверные данные" } );
      if( data.rows[0].telegramid !== null ) error( { error : "Вы уже зарегистрированы" } );

      return this.modules.db.query(
        "update workers " +
        "set telegramid = $1 " +
        "where id = $2 " +
        "returning name",
        [ authData.telegramId, data.rows[0].id ]
      );
    } )
    .then( data => success( { name : data.rows[0].name } ) )
    .catch( error => fatal( error, "authorize" ) ) );
  }
}

module.exports = Workers;
