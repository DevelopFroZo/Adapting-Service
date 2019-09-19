let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class PossibleAnswers extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "PossibleAnswers" );
  }

  async add( token, questionId, description, isRight, isCalledFromProgram ){
    let data;

    data = await this.modules.db.query(
      "insert into possibleanswers( questionid, description, isright ) " +
      "values( $1, $2, $3 ) " +
      "returning id",
      [ questionId, description, isRight ]
    );

    return {
      isSuccess : true,
      id : data.rows[0].id
    };
  }
}

module.exports = PossibleAnswers;
