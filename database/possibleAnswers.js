let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class PossibleAnswers extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "PossibleAnswers" );
  }

  add( token, questionId, description, isRight, isCalledFromProgram ){
    return super.promise( ( success, error, fatal ) => this.modules.companies.isTokenValid(
      token, isCalledFromProgram
    )
    .then( data => this.modules.db.query(
      "insert into possibleanswers( questionid, description, isright ) " +
      "values( $1, $2, $3 ) " +
      "returning id",
      [ questionId, description, isRight ]
    ) )
    .then( data => success( { id : data.rows[0].id } ) )
    .catch( error => fatal( error, "add" ) ) );
  }
}

module.exports = PossibleAnswers;
