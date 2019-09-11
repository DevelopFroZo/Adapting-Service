let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class PossibleAnswers extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "PossibleAnswers" );
  }

  add( token, questionId, answerData ){
    return super.promise( ( success, error, fatal ) => this.modules.companies.isTokenValid(
      token
    )
    .then( data => {
      if( !data ) error( data );

      return this.modules.db.query(
        "insert into possibleanswers( questionid, description, isright ) " +
        "values( $1, $2, $3 ) " +
        "returning id",
        [ questionId, answerData.description, answerData.isRight ]
      );
    } )
    .then( data => success( { id : data.rows[0].id } ) )
    .catch( error => fatal( error, "add" ) ) );
  }
}

module.exports = PossibleAnswers;
