let BaseDatabaseClass;

BaseDatabaseClass = require( "./baseDatabaseClass" );

class Tests extends BaseDatabaseClass{
  constructor( modules ){
    super( modules, "Tests" );
  }

  add( token, testData ){
    return super.promise( ( success, error, fatal ) => this.modules.companies.isTokenValid(
      token
    )
    .then( data => {
      if( !data.isSuccess ) error( { error : data.error } );

      return this.modules.db.query(
        "insert into tests( infoblockid, name, description ) " +
        "values( $1, $2, $3 ) " +
        "returning id",
        [ 1, testData.test.name, testData.test.description ]
      );
    } )
    .then( data => {
      let testId, c;

      testId = data.rows[0].id;
      c = 0;

      return new Promise( ( res, rej ) => {
        for( let i = 0; i < testData.questions.length; i++ ) this.modules.questions.add(
          token, testId, testData.questions[i]
        )
        .then( () => {
          c++;

          if( c === testData.questions.length ) res( testId );
        } )
        .catch( rej );
      } );

      return testId;
    } )
    .then( testId => success( { id : testId } ) )
    .catch( error => fatal( error, "add" ) ) );
  }
}

module.exports = Tests;
