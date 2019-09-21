let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class PossibleAnswers extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "PossibleAnswers" );
  }

  async add( token, questionId, description, isRight, number, isCalledFromProgram ){
    let data;

    data = await this.modules.db.query(
      "insert into possibleanswers( questionid, description, isright, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ questionId, description, isRight, number ]
    );

    return {
      isSuccess : true,
      id : data.rows[0].id
    };
  }
}

module.exports = PossibleAnswers;
