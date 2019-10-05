/*
 *  Error codes:
 *  -1 -- проблемы с базой данных
 *   0 -- ошибка авторизации
 *   1 -- несоответствие статусу
 *   2 -- работник уже авторизован в переданной компании
 *   3 -- информации для изучения больше нет
 *   4 -- истекло время на ответ
 *   5 -- один из ответов не содержит число
 *   6 -- не найдено работников со статусом 3
 *
 *  Success code:
 *   0 -- тест пройден
 *   1 -- ответ принят
 */

class Telegram{
  constructor( modules ){
    this.modules = modules;
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

    data = await this.modules.db.query(
      "select status " +
      "from workersstates " +
      "where telegramid = $1 and isusing",
      [ telegramId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : "Authorize failed"
    };

    return {
      isSuccess : true,
      status : data.rows[0].status
    }
  }

  async authorize( companyName, key, telegramId ){
    let status, data, workerId, client, name;

    companyName = companyName.toLowerCase();
    status = await this.getStatus( telegramId );

    if( status.isSuccess && status.status > 1 ) return {
      isSuccess : false,
      code : 1,
      message : "Status mismatch"
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
      code : 0,
      message : "Authorize failed"
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
      code : 2,
      message : "Worker already authorized"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      await client.query(
        "insert into workersstates( workerid, telegramid ) " +
        "values( $1, $2 )",
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

      return {
        isSuccess : true,
        name
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Telegram.authorize)"
      };
    }
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
    let status, client, infoBlock;

    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status > 1 ) return {
      isSuccess : false,
      code : 1,
      message : "Status mismatch"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      if( status.status === 0 ) await this.updateInfoBlockIndex( client, telegramId );

      infoBlock = await client.query(
        "select ib.name, ib.description " +
        "from infoblocks as ib, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   ib.id = ws.infoblockid",
        [ telegramId ]
      );

      if( infoBlock.rowCount === 0 ){
        await client.query( "commit" );
        await client.release();

        return {
          isSuccess : false,
          code : 3,
          message : "Info block not found"
        };
      }

      infoBlock = infoBlock.rows[0];

      if( status.status === 0 ) await this.setStatus( client, telegramId, 1 );

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        infoBlock
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Telegram.getInfoBlock)"
      };
    }
  }

  async getQuestion( telegramId ){
    let status, client, question, possibleAnswers;

    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status < 1 || status.status > 3 ) return {
      isSuccess : false,
      code : 1,
      message : "Status mismatch"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      if(
        status.status === 1 ||
        status.status === 2
      ) await client.query(
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

      question = await client.query(
        "select q.description, q.type, q.time, q.number " +
        "from questions as q, workersstates as ws " +
        "where" +
        "   ws.telegramid = $1 and" +
        "   ws.isusing and" +
        "   q.id = ws.questionid",
        [ telegramId ]
      );

      if( question.rowCount === 0 ){
        await client.query(
          "update workersstates " +
          "set status = 0, questionnumber = 0 " +
          "where telegramid = $1 and isusing",
          [ telegramId ]
        );

        await client.query( "commit" );
        await client.release();

        return {
          isSuccess : true,
          code : 0,
          message : "Test passed"
        };
      } else {
        question = question.rows[0];

        if(
          status.status === 1 ||
          status.status === 2
        ) await this.setStatus( client, telegramId, 3 );

        if( question.type === "variant" ) possibleAnswers = ( await client.query(
          "select pa.description " +
          "from possibleanswers as pa, workersstates as ws " +
          "where" +
          "   ws.telegramid = $1 and" +
          "   ws.isusing and" +
          "   pa.questionid = ws.questionid " +
          "order by pa.number",
          [ telegramId ]
        ) ).rows;
        else possibleAnswers = null;

        await client.query(
          "update workersstates " +
          "set answertype = $1 " +
          "where" +
          "   telegramid = $2 and" +
          "   isusing",
          [ question.type, telegramId ]
        );

        await client.query( "commit" );
        await client.release();

        return {
          isSuccess : true,
          question,
          possibleAnswers
        };
      }
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Telegram.getQuestion)"
      };
    }
  }

  async acceptQuestion( telegramId, time ){
    let status, client;

    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status !== 3 ) return {
      isSuccess : false,
      code : 1,
      message : "Status mismatch"
    };

    client = await this.modules.db.connect()

    try{
      await client.query( "begin" );

      await client.query(
        "update workersstates " +
        "set time = $1 " +
        "where telegramid = $2 and isusing",
        [ time, telegramId ]
      );
      await this.setStatus( client, telegramId, 4 );

      await client.query( "commit" );
      await client.release();

      return { isSuccess : true };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Telegram.acceptQuestion)"
      };
    }
  }

  async sendAnswer( telegramId, answer, time ){
    let status, client, workerState, question, possibleAnswerNumber, isTimePassed, possibleAnswer;

    answer = answer.toLowerCase();
    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status !== 4 ) return {
      isSuccess : false,
      code : 1,
      message : "Status mismatch"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      workerState = ( await client.query(
        "select workerid, questionid, answertype, time " +
        "from workersstates " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      ) ).rows[0];
      isTimePassed = ( await client.query(
        "select time * 60 >= $1 as istimepassed " +
        "from questions " +
        "where id = $2",
        [ time - workerState.time, workerState.questionid ]
      ) ).rows[0].istimepassed;

      if( !isTimePassed ){
        client.query(
          "insert into workersanswers( workerid, questionid, answer, isright ) " +
          "values( $1, $2, '', false )",
          [ workerState.workerid, workerState.questionid ]
        );
        await this.setStatus( client, telegramId, 2 );

        client.query( "commit" );
        client.release();

        return {
          isSuccess : false,
          code : 4,
          message : "Answer timed out"
        };
      };

      if( workerState.answertype === "variant" ){
        answer = answer.split( " " );

        for( let i = 0; i < answer.length; i++ ){
          possibleAnswerNumber = parseInt( answer[i] );

          if( isNaN( possibleAnswerNumber) ){
            await client.query( "rollback" );
            await client.release();

            return {
              isSuccess : false,
              code : 5,
              message : "One of answers doesn't contains number"
            };
          }
          else{
            possibleAnswer = ( await client.query(
              "select pa.description, pa.isright " +
              "from possibleanswers as pa, workersstates as ws " +
              "where" +
              "   pa.questionid = ws.questionid and" +
              "   ws.telegramid = $1 and" +
              "   ws.isusing and" +
              "   pa.number = $2",
              [ telegramId, possibleAnswerNumber ]
            ) ).rows[0];
            await client.query(
              "insert into workersanswers( workerid, questionid, answer, isright ) " +
              "values( $1, $2, $3, $4 )",
              [
                workerState.workerid,
                workerState.questionid,
                possibleAnswer.description,
                possibleAnswer.isright
              ]
            );
          }
        }
      } else {
        await client.query(
          "insert into workersanswers( workerid, questionid, answer ) " +
          "values( $1, $2, $3 )",
          [ workerState.workerid, workerState.questionid, answer ]
        );

        if( workerState.answertype === "short" ) await client.query(
          "update workersanswers " +
          "set isright = $1 = (" +
          "   select description" +
          "   from possibleanswers" +
          "   where" +
          "     questionid = $2 ) " +
          "where" +
          "   workerid = $3 and" +
          "   questionid = $2",
          [
            answer,
            workerState.questionid,
            workerState.workerid
          ]
        );
      }

      await this.setStatus( client, telegramId, 2 );

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        code : 1,
        message : "Answer accepted"
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Telegram.sendAnswer)"
      };
    }
  }

  async getWorkersWithStatus3(){
    let data;

    data = await this.modules.db.query(
      "select telegramid " +
      "from workersstates " +
      "where status = 3"
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 6,
      message : "Workers not found"
    };

    return data.rows;
  }
}

module.exports = Telegram;
