let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Questions extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Questions" );
  }

  add( token, infoBlockId, name, description, type, time, number, possibleAnswers, isCalledFromProgram ){
    return super.promise( ( success, error, fatal ) => this.modules.companies.isTokenValid(
      token, isCalledFromProgram
    )
    .then( () => this.modules.db.query(
      "insert into questions( infoblockid, name, description, type, time, number ) " +
      "values( $1, $2, $3, $4, $5, $6 ) " +
      "returning id",
      [ infoBlockId, name, description, type, time, number ]
    ) )
    .then( data => {
      let questionId, c;

      questionId = data.rows[0].id;
      c = 0;

      return new Promise( ( res, rej ) => possibleAnswers.map( possibleAnswer => this.modules.possibleAnswers.add(
        token, questionId,
        possibleAnswer.description,
        possibleAnswer.isRight,
        possibleAnswer.number, true
      )
      .then( ++c === possibleAnswer.length ? res( questionId ) : {} )
      .catch( rej ) ) );
    } )
    .then( questionId => success( { id : questionId } ) )
    .catch( error => fatal( error, "add" ) ) );
  }
}

module.exports = Questions;
