let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class Tests extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Tests" );
  }

  async get( companyId, infoBlockId ){
    let data, test, tmp;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    test = {};
    test.infoBlock = ( await super.query(
      "select name, description " +
      "from infoblocks " +
      "where id = $1",
      [ infoBlockId ]
    ) ).rows[0];
    test.questions = ( await super.query(
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
      tmp = ( await super.query(
        "select id, questionid, description, isright, number " +
        "from possibleanswers " +
        `where questionid in ( ${tmp.join( ", " )} ) ` +
        "order by number"
      ) ).rows;

      test.questions.map( question => tmp.map( possibleAnswer => {
        if( question.id === possibleAnswer.questionid ){
          delete possibleAnswer.questionid;
          question.possibleAnswers.push( possibleAnswer );
        }
      } ) );
    }

    return super.success( 4, test );
  }
}

module.exports = Tests;
