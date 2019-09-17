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

    await client.release();
  }

  async updateQuestionIndex( telegramId ){
    let client;

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );
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
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
    }

    await client.release();
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

  async authorize( companyName, key, telegramId ){
    let status, data, workerId, client, name;

    status = await this.getStatus( telegramId );

    if( typeof( status ) === "number" && status > 1 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
    };

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
      await client.release();
    }
    catch{
      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        error : "Problems with database"
      };
    }

    await this.updateInfoBlockIndex( telegramId );
    await this.updateQuestionIndex( telegramId );

    return {
      isSuccess : true,
      name
    };
  }

  async getInfoBlock( telegramId ){
    let status, client, infoBlock;

    status = await this.getStatus( telegramId );

    if( status.isSuccess === false ) return status;
    if( status > 1 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );
      await client.query(
        "update workersstates " +
        "set status = 1 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      infoBlock = ( await client.query(
        "select ib.name, ib.description " +
        "from infoblocks as ib, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   ib.id = ws.infoblockid",
        [ telegramId ]
      ) ).rows[0];
      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        name : infoBlock.name,
        description : infoBlock.description
      };
    }
    catch{
      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        error : "Problems with database"
      };
    }
  }

  async getQuestion( telegramId ){
    let status, client, question, possibleAnswers;

    status = await this.getStatus( telegramId );

    if( status.isSuccess === false ) return status;
    if( status !== 1 && status !== 2 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );
      await client.query(
        "update workersstates " +
        "set status = 2 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      question = ( await client.query(
        "select q.name, q.description, q.type " +
        "from questions as q, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   q.id = ws.questionid",
        [ telegramId ]
      ) ).rows[0];

      if( question.type === "variant" ) possibleAnswers = ( await client.query(
        "select pa.description " +
        "from possibleanswers as pa, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   pa.questionid = ws.questionid",
        [ telegramId ]
      ) ).rows;
      else possibleAnswers = null;

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        question,
        possibleAnswers
      };
    }
    catch( error ){
      await client.query( "rollback" );
      await client.release();
      console.log( error );

      return {
        isSuccess : false,
        error : "Problems with database"
      };
    }
  }

  async acceptQuestion( telegramId ){
    let status, client;

    status = await this.getStatus( telegramId );

    if( status.isSuccess === false ) return status;
    if( status !== 2 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
    };

    await this.modules.db.query(
      "update workersstates " +
      "set status = 3 " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    );

    return { isSuccess : true };
  }

  async sendAnswer( telegramId, answer ){
    let status, client, workerstate, question;

    status = await this.getStatus( telegramId );

    if( status.isSuccess === false ) return status;
    if( status !== 3 ) return {
      isSuccess : false,
      error : "Невозможно выполнить операцию"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );
      workerstate = ( await client.query(
        "select workerid, questionid " +
        "from workersstates " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      ) ).rows[0];
      await client.query(
        "insert into workersanswers( workerid, questionid, answer ) " +
        "values( $1, $2, $3 )",
        [ workerstate.workerid, workerstate.questionid, answer ]
      );
      await client.query(
        "update workersstates " +
        "set status = 1 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      await client.query( "commit" );
      await client.release();

      await this.updateQuestionIndex( telegramId );

      return {
        isSuccess : true,
        message : "Ваш ответ принят"
      };
    }
    catch( error ){
      await client.query( "rollback" );
      console.log( error );

      return {
        isSuccess : false,
        error : "Problems with database"
      };
    }
  }
}

module.exports = Telegram;
