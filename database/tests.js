let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Tests extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Tests" );
  }

  add( token, infoBlockId, questions ){
    return super.promise( ( success, error, fatal ) => this.modules.companies.isTokenValid(
      token
    )
    .then( data => {
      let c;

      c = 0;

      return new Promise( ( res, rej ) => questions.map( question => this.modules.questions.add(
        token, infoBlockId, question.name,
        question.description, question.type,
        question.time, question.number,
        question.possibleAnswers
      )
      .then( ++c === questions.length ? res() : {} )
      .catch( rej ) ) );
    } )
    .then( () => success()  )
    .catch( error => fatal( error, "add" ) ) );
  }
}

module.exports = Tests;
