class Tests{
  constructor( modules ){
    this.modules = modules;
  }

  async get( companyId, infoBlockId ){
    let data, test, client, tmp;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    test = {};
    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      test.infoBlock = ( await client.query(
        "select name, description " +
        "from infoblocks " +
        "where id = $1",
        [ infoBlockId ]
      ) ).rows[0];

      test.questions = ( await client.query(
        "select id, description, time, type, number " +
        "from questions " +
        "where infoblockid = $1 " +
        "order by number",
        [ infoBlockId ]
      ) ).rows;
      tmp = [];
      test.questions.map( question => {
        question.possibleAnswers = [];
        tmp.push( question.id );
      } );

      if( tmp.length > 0 ){
        tmp = ( await client.query(
          "select id, questionid, description, isright, number " +
          "from possibleanswers " +
          `where questionid in ( ${tmp.join( ", " )} ) ` +
          "order by number"
        ) ).rows;

        test.questions.map( question => tmp.map( possibleAnswer => {
          if( question.id === possibleAnswer.questionid )
            question.possibleAnswers.push( possibleAnswer );
        } ) );
      }

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        code : -2,
        test
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Tests.get)"
      };
    }
  }
}

module.exports = Tests;
