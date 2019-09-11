let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class InfoBlocks extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "InfoBlocks" );
  }

  getForWorker( authData ){
    return super.promise( ( success, error, fatal ) => this.modules.workers.isTelegramIdValid(
      authData
    )
    .then( data => {
      if( !data.isSuccess ) error( { error : data.error } );

      return this.modules.db.query(
        "select r.name as companyname, e.name, e.description " +
        "from blockstoworkers as q, workers as w, infoblocks as e, companies as r " +
        "where" +
        " q.workerid = w.id and " +
        " q.infoblockid = e.id and " +
        " w.companyid = r.id and " +
        " w.telegramid = $1 and " +
        " w.isoncompany and " +
        " w.infoblocknumber <= e.number and " +
        " w.questionid is null " +
        "order by e.number " +
        "limit 1",
        [ authData.telegramId ]
      );
    } )
    .then( data => success( {
      companyName : data.rows[0].companyname,
      infoBlock : {
        name : data.rows[0].name,
        description : data.rows[0].description
      }
    } ) )
    .catch( error => fatal( error, "getForWorker" ) ) );
  }
}

module.exports = InfoBlocks;
