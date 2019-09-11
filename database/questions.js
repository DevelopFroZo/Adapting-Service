let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Questions extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Questions" );
  }

  add( token, testId, questionData, isCalledFromProgram ){
    return super.promise( ( success, error, fatal ) => this.modules.companies.isTokenValid(
      token, isCalledFromProgram
    )
    .then( data => {
      if( !data.isSuccess ) error( data );

      return this.modules.db.query(
        "insert into questions( testid, name, description, type, time ) " +
        "values( $1, $2, $3, $4, $5 ) " +
        "returning id",
        [
          testId,
          questionData.name,
          questionData.description,
          questionData.type,
          questionData.time
        ]
      );
    } )
    .then( data => {
      let questionId, c;

      questionId = data.rows[0].id;
      c = 0;

      return new Promise( ( res, rej ) => {
        for( let i = 0; i < questionData.possibleAnswers.length; i++ ) this.modules.possibleAnswers.add(
          token, questionId, questionData.possibleAnswers[i], isCalledFromProgram
        )
        .then( () => {
          c++;

          if( c === questionData.possibleAnswers.length ) res( questionId );
        } )
        .catch( rej );
      } );
    } )
    .then( questionId => success( { id : questionId } ) )
    .catch( error => fatal( error, "add" ) ) );
  }
}

module.exports = Questions;
