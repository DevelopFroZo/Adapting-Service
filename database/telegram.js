let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Telegram extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Telegram" );
  }

  async updateInfoBlockIndex( telegramId ){
    let client;

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );
      await client.query(
        "update workersstates " +
        "set infoblocknumber = infoblocknumber + 1 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      await client.query(
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
      );
      await client.query( "commit" );
    }
    catch{
      await client.query( "rollback" );
    }
  }

  async updateQuestionIndex( telegramId ){
    let client;

    client = await this.modules.db.connect();

    try{
      await client.query( "commit" );
      await client.query(
        "update workersstates " +
        "set questionnumber = questionnumber + 1 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      await client.query(
        "update workersstates " +
        "set questionid = ( " +
        "   select q.id" +
        "   from questions as q, workersstates as ws" +
        "   where" +
        "     q.infoblockid = ws.infoblockid and" +
        "     ws.telegramid = $1 and" +
        "     ws.isusing and" +
        "     q.number = ws.questionnumber" +
        ") " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      await client.query( "commit" );
    }
    catch{
      await client.query( "rollback" );
    }
  }

  async authorize( companyName, key, telegramId ){
    let data, workerId, client, name;

    data = await this.modules.db.query(
      "select w.id " +
      "from workers as w, companies as c " +
      "where" +
      "   w.companyid = c.id and" +
      "   w.key = $1 and" +
      "   c.name = $2",
      [ key, companyName ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      error : "Ошибка авторизации"
    };

    workerId = data.rows[0].id;

    data = await this.modules.db.query(
      "select workerid " +
      "from workersstates " +
      "where workerid = $1",
      [ workerId ]
    );

    if( data.rowCount === 1 ) return {
      isSuccess : false,
      error : "Вы уже авторизованы в этой компании"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );
      await client.query(
        "insert into workersstates( workerid, telegramid, isusing ) " +
        "values( $1, $2, true )",
        [ workerId, telegramId ]
      );
      await client.query(
        "update workersstates " +
        "set isusing = false " +
        "where telegramid = $1 and not workerid = $2",
        [ telegramId, workerId ]
      );
      name = ( await client.query(
        "select name " +
        "from workers " +
        "where id = $1",
        [ workerId ]
      ) ).rows[0].name;
      await client.query( "commit" );
    }
    catch{
      await client.query( "rollback" );

      return {
        isSuccess : false,
        error : "Problems with database"
      }
    }

    await this.updateInfoBlockIndex( telegramId );
    await this.updateQuestionIndex( telegramId );

    return {
      isSuccess : true,
      name
    };
  }

  async getStatus( telegramId ){
    let data;

    data = await this.modules.db.query(
      "select status " +
      "from workersstates " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      error : "Ошибка авторизации"
    };

    return data.rows[0].status;
  }

  async getInfoBlock( telegramId ){
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
        "select ib.name, ib.description " +
        "from infoblocks as ib, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   ib.id = ws.infoblockid",
        [ telegramId ]
      ) )
      .then( data => client.query( "commit" ).then( () => success2( data.rows[0] ) ) )
      .catch( error => client.query( "rollback" ).then( () => fatal2( error, "getInfoBlock (transaction)" ) ) ) ) );
    } )
    .then( success )
    .catch( error => fatal( error, "getInfoBlock" ) ) );
  }

  getQuestion( telegramId ){
    return super.promise( ( success, error, fatal ) => this.getStatus(
      telegramId
    )
    .then( status => {
      if( status !== 1 && status !== 4 ) error( { error : "Невозможно выполнить действие" } );

      let question;

      return super.promise( ( success2, error2, fatal2 ) => this.modules.db.connect( ( err, client ) => client.query(
        "begin"
      )
      .then( () => client.query(
        "update workersstates " +
        "set status = 2 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      ) )
      .then( () => client.query(
        "select q.name, q.description, q.type " +
        "from questions as q, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   q.id = ws.questionid",
        [ telegramId ]
      ) )
      .then( data => {
        question = data.rows[0];

        if( question.type === "variant" ) return this.modules.db.query(
          "select pa.description " +
          "from possibleanswers as pa, workersstates as ws " +
          "where" +
          "   ws.telegramid = $1 and" +
          "   ws.isusing and" +
          "   pa.questionid = ws.questionid",
          [ telegramId ]
        );
        else return { rows : [] };
      } )
      .then( data => client.query( "commit" ).then( () => success2( {
        question,
        possibleAnswers : data.rows
      } ) ) )
      .catch( error => client.query( "rollback" ).then( () => fatal2( error, "getQuestion (transaction)" ) ) ) ) );
    } )
    .then( success )
    .catch( error => fatal( error, "getInfoBlock" ) ) );
  }

  acceptQuestion( telegramId ){
    return super.promise( ( success, error, fatal ) => this.getStatus(
      telegramId
    )
    .then( status => {
      if( status !== 2 ) error( { error : "Невозможно выполнить действие" } );

      return this.modules.db.query(
        "update workersstates " +
        "set status = 3 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
    } )
    .then( () => success() )
    .catch( error => fatal( error, "acceptedQuestion" ) ) );
  }
}

module.exports = Telegram;
