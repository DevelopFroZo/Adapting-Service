let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class Telegram extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Telegram" );
  }

  async updateInfoBlockIndex( client, telegramId ){
    let data;

    data = await client.query(
      "select ib.id, ib.number " +
      "from blockstoworkers as btw, infoblocks as ib, workersstates as ws " +
      "where" +
      "   btw.infoblockid = ib.id and" +
      "   ws.workerid = btw.workerid and" +
      "   ws.telegramid = $1 and" +
      "   ws.isusing and" +
      "   ib.number >= ws.infoblocknumber + 1 " +
      "order by ib.number " +
      "limit 1",
      [ telegramId ]
    );

    if( data.rowCount === 0 ) await client.query(
      "update workersstates " +
      "set infoblockid = null " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    );
    else{
      data = data.rows[0];

      await client.query(
        "update workersstates " +
        "set infoblocknumber = $1, infoblockid = $2 " +
        "where telegramid = $3 and isusing",
        [ data.number, data.id, telegramId ]
      );
    }
  }

  async getStatus( telegramId ){
    let data;

    data = await super.query(
      "select status " +
      "from workersstates " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    );

    if( data.rowCount === 0 ) return super.error( 2 );

    return super.success( 1, data.rows[0].status );
  }

  async authorize( companyName, key, telegramId ){
    let status, data, workerId, transaction, name;

    companyName = companyName.toLowerCase();
    status = await this.getStatus( telegramId );

    if( status.ok && status.data > 1 ) return super.error( 3 );

    data = await super.query(
      "select w.id " +
      "from workers as w, companies as c " +
      "where" +
      "   w.companyid = c.id and" +
      "   w.key = $1 and" +
      "   lower( c.name ) = $2",
      [ key, companyName ]
    );

    if( data.rowCount === 0 ) return super.error( 4 );

    workerId = data.rows[0].id;

    data = await super.query(
      "select workerid " +
      "from workersstates " +
      "where workerid = $1",
      [ workerId ]
    );

    if( data.rowCount === 1 ) return super.error( 5 );

    transaction = await super.transaction();
    await transaction.query(
      "insert into workersstates( workerid, telegramid ) " +
      "values( $1, $2 )",
      [ workerId, telegramId ]
    );
    await transaction.query(
      "update workersstates " +
      "set isusing = false " +
      "where telegramid = $1 and not workerid = $2",
      [ telegramId, workerId ]
    );
    name = ( await transaction.query(
      "select name " +
      "from workers " +
      "where id = $1",
      [ workerId ]
    ) ).rows[0].name;
    await transaction.end();

    return super.success( 2, name );
  }

  async setStatus( client, telegramId, status ){
    await client.query(
      "update workersstates " +
      "set status = $1 " +
      "where telegramid = $2 and isusing",
      [ status, telegramId ]
    );
  }

  async getInfoBlock( telegramId ){
    let status, transaction, infoBlock;

    status = await this.getStatus( telegramId );

    if( !status.ok ) return status;
    if( status.data > 1 ) return super.error( 3 );

    transaction = await super.transaction();

    if( status.data === 0 ) await this.updateInfoBlockIndex( transaction, telegramId );

    infoBlock = await transaction.query(
      "select ib.name, ib.description " +
      "from infoblocks as ib, workersstates as ws " +
      "where" +
      "   ws.telegramid = $1 and" +
      "   ws.isusing and" +
      "   ib.id = ws.infoblockid",
      [ telegramId ]
    );

    if( infoBlock.rowCount === 0 ){
      await transaction.end( false );

      return super.error( 6 );
    }

    if( status.data === 0 ) await this.setStatus( transaction, telegramId, 1 );

    await transaction.end();

    return super.success( 3, infoBlock.rows[0] );
  }

  async getQuestion( telegramId ){
    let status, transaction, question, possibleAnswers, countOfRightAnswers;

    status = await this.getStatus( telegramId );

    if( !status.ok ) return status;
    if( status.data < 1 || status.data > 3 ) return super.error( 3 );

    transaction = await super.transaction();

    if( status.data < 3 ) await transaction.query(
      "update workersstates " +
      "set questionnumber = questionnumber + 1, " +
      "questionid = ( " +
      "   select q.id" +
      "   from questions as q, workersstates as ws" +
      "   where" +
      "     q.infoblockid = ws.infoblockid and" +
      "     ws.telegramid = $1 and" +
      "     ws.isusing and" +
      "     q.number = ws.questionnumber + 1" +
      ") " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    );

    question = await transaction.query(
      "select q.description, q.type, q.time, q.number " +
      "from questions as q, workersstates as ws " +
      "where" +
      "   ws.telegramid = $1 and" +
      "   ws.isusing and" +
      "   q.id = ws.questionid",
      [ telegramId ]
    );

    if( question.rowCount === 0 ){
      await transaction.query(
        "update workersstates " +
        "set status = 0, questionnumber = 0 " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      );
      await transaction.end();

      return super.success( 4 );
    }

    question = question.rows[0];

    if( status.data < 3 ) await this.setStatus( transaction, telegramId, 3 );

    if( question.type === "variant" ){
      possibleAnswers = ( await transaction.query(
        "select pa.description, pa.isright " +
        "from possibleanswers as pa, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   pa.questionid = ws.questionid " +
        "order by pa.number",
        [ telegramId ]
      ) ).rows;
      countOfRightAnswers = 0;
      possibleAnswers.map( possibleAnswer => {
        countOfRightAnswers += possibleAnswer.isright ? 1 : 0;
        delete possibleAnswer.isright;
      } );

      if( countOfRightAnswers !== 1 ) question.type = "many variant";
      else question.type = "one variant";
    }
    else possibleAnswers = null;

    await transaction.query(
      "update workersstates " +
      "set answertype = $1 " +
      "where" +
      "   telegramid = $2 and" +
      "   isusing",
      [ question.type, telegramId ]
    );
    await transaction.end();

    return super.success( 5, { question, possibleAnswers } );
  }

  async acceptQuestion( telegramId ){
    let time, status, transaction;

    time = ( new Date() ).getTime();
    status = await this.getStatus( telegramId );

    if( !status.ok ) return status;
    if( status.data !== 3 ) return super.error( 3 );

    transaction = await super.transaction();
    await transaction.query(
      "update workersstates " +
      "set time = $1 " +
      "where telegramid = $2 and isusing",
      [ time, telegramId ]
    );
    await this.setStatus( transaction, telegramId, 4 );
    await transaction.end();

    return super.success( 6 );
  }

  async sendAnswerChecks( telegramId ){
    let time, status, transaction, workerState, isTimePassed;

    time = ( new Date() ).getTime();
    status = await this.getStatus( telegramId );

    if( !status.ok ) return status;
    if( status.data !== 4 ) return super.error( 3 );

    transaction = await super.transaction();
    workerState = ( await transaction.query(
      "select workerid, questionid, answertype, time " +
      "from workersstates " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    ) ).rows[0];
    isTimePassed = ( await transaction.query(
      "select time * 60 >= $1 as istimepassed " +
      "from questions " +
      "where id = $2",
      [ Math.floor( ( time - parseInt( workerState.time ) ) / 1000 ), workerState.questionid ]
    ) ).rows[0].istimepassed;

    if( !isTimePassed ){
      await transaction.query(
        "insert into workersanswers( workerid, questionid, answer, isright ) " +
        "values( $1, $2, '', false )",
        [ workerState.workerid, workerState.questionid ]
      );
      await this.setStatus( transaction, telegramId, 2 );
      await transaction.end();

      return super.error( 7 );
    }

    return super.success( 0, [ transaction, workerState ] );
  }

  async sendShortOrLongAnswer( telegramId, answer ){
    let data, transaction, workerState;

    data = await this.sendAnswerChecks( telegramId );

    if( !data.ok ) return super.error( data.code );

    transaction = data.data[0];
    workerState = data.data[1];
    await transaction.query(
      "insert into workersanswers( workerid, questionid, answer ) " +
      "values( $1, $2, $3 )",
      [ workerState.workerid, workerState.questionid, answer ]
    );
    answer = answer.toLowerCase();

    if( workerState.answertype === "short" ) await transaction.query(
      "update workersanswers " +
      "set isright = $1 = lower( (" +
      "   select description" +
      "   from possibleanswers" +
      "   where" +
      "     questionid = $2 ) ) " +
      "where" +
      "   workerid = $3 and" +
      "   questionid = $2",
      [
        answer,
        workerState.questionid,
        workerState.workerid
      ]
    );

    await this.setStatus( transaction, telegramId, 2 );
    await transaction.end();

    return super.success( 7 );
  }

  async sendVariantAnswer( telegramId, possibleAnswerIds ){
    let data, transaction, workerState, possibleAnswers, answers;

    data = await this.sendAnswerChecks( telegramId );

    if( !data.ok ) return super.error( data.code );

    transaction = data.data[0];
    workerState = data.data[1];

    if( possibleAnswerIds.length > 0 ){
      possibleAnswers = ( await transaction.query(
        "select description, isright " +
        "from possibleanswers " +
        `where id in ( ${possibleAnswerIds.join( ", " )} )`
      ) ).rows;
      answers = "";

      for( let i = 0; i < possibleAnswers.length; i++ ){
        answers += `( ${workerState.workerid}, ${workerState.questionid}, '${possibleAnswers[i].description}', ${possibleAnswers[i].isright} )`;

        if( i < possibleAnswers.length - 1 ) answers += ", ";
      }
    }
    else answers = `( ${workerState.workerid}, ${workerState.questionid}, '', false )`;

    await transaction.query(
      "insert into workersanswers( workerid, questionid, answer, isright ) " +
      `values ${answers}`
    );
    await this.setStatus( transaction, telegramId, 2 );
    await transaction.end();

    return super.success( 7 );
  }

  async getWorkersWithStatus3(){
    let data;

    data = await super.query(
      "select telegramid " +
      "from workersstates " +
      "where status = 3"
    );

    if( data.rowCount === 0 ) return super.error( 9 );

    return super.success( 8, data.rows );
  }
}

module.exports = Telegram;
