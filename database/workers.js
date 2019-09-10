class Workers{
  constructor( modules ){
    this.modules = modules;
  }

  authorize( authData ){
    return new Promise( ( res, rej ) => this.modules.db.query(
      "select q.id, q.key, q.telegramid " +
      "from workers as q, companies as w " +
      "where q.companyid = w.id and q.key = $1 and w.name = $2",
      [ authData.key, authData.companyName ]
    )
    .then( data => {
      if( data.rowCount === 0 ){
        res( {
          isSuccess : false,
          message : "Введены неверные данные"
        } );

        return;
      }

      return data;
    } )
    .then( data => {
      if( data.rows[0].telegramid !== null ){
        res( {
          isSuccess : false,
          message : "Вы уже зарегистрированы"
        } );

        return;
      }

      return data;
    } )
    .then( data => {
      return this.modules.db.query(
        "update workers " +
        "set telegramid = $1 " +
        "where id = $2 " +
        "returning name",
        [ authData.telegramId, data.rows[0].id ]
      );
    } )
    .then( data => res( {
      isSuccess : true,
      name : data.rows[0].name
    } ) )
    .catch( rej ) );
  }
}

module.exports = Workers;
