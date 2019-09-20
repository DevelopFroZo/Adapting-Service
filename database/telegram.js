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
      error : "Ошибка авторизации"
    };

    return {
      isSuccess : true,
      status : data.rows[0].status
    }
  }

  async authorize( companyName, key, telegramId ){
    let status, data, workerId, client, name;

    status = await this.getStatus( telegramId );

    if( status.status > 1 ) return {
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
        error : "Problems with database"
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
      error : "Невозможно выполнить действие"
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
          error : "Информации для изучения больше нет"
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
        error : "Problems with database"
      };
    }
  }

  async getQuestion( telegramId ){
    let status, client, question, possibleAnswers;

    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status < 1 || status.status > 3 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
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
        "select q.name, q.description, q.type, q.time " +
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
          isSuccess : false,
          error : "Вы прошли тест"
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
        error : "Problems with database"
      };
    }
  }

  async acceptQuestion( telegramId ){
    let status, client;

    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status !== 3 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
    };

    await this.setStatus( this.modules.db, telegramId, 4 );

    return { isSuccess : true };
  }

  async sendAnswer( telegramId, answer ){
    let status, client, workerstate, question, possibleAnswerNumber, possibleAnswer;

    status = await this.getStatus( telegramId );

    if( !status.isSuccess ) return status;
    if( status.status !== 4 ) return {
      isSuccess : false,
      error : "Невозможно выполнить действие"
    };

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      workerstate = ( await client.query(
        "select workerid, questionid, answertype " +
        "from workersstates " +
        "where telegramid = $1 and isusing",
        [ telegramId ]
      ) ).rows[0];

      if( workerstate.answertype === "variant" ){
        answer = answer.split( " " );

        for( let i = 0; i < answer.length; i++ ){
          possibleAnswerNumber = parseInt( answer[i] );

          if( isNaN( possibleAnswerNumber) ){
            client.query( "rollback" );
            client.release();

            return {
              isSuccess : false,
              error : "Введите ответ одним числом " +
                      "или несколькими через пробел"
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
                workerstate.workerid,
                workerstate.questionid,
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
          [ workerstate.workerid, workerstate.questionid, answer ]
        );

        if( workerstate.answertype === "short" ) await client.query(
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
            workerstate.questionid,
            workerstate.workerid
          ]
        );
      }

      await this.setStatus( client, telegramId, 2 );

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        message : "Ваш ответ принят"
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        error : "Problems with database"
      };
    }
  }
}

module.exports = Telegram;
