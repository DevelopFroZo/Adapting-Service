class Tests{
  constructor( modules ){
    this.modules = modules;
  }

  add( token, testData ){
    return new Promise( ( res, rej ) => this.modules.companies.isTokenValid(
      token
    )
    .then( data => {
      if( !data ){
        res( {
          isSuccess : false,
          message : "Пользователь не авторизован"
        } );

        return;
      }

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

      return new Promise( ( res2, rej2 ) => {
        for( let i = 0; i < testData.questions.length; i++ ) this.modules.questions.add(
          token, testId, testData.questions[i]
        )
        .then( () => {
          c++;

          if( c === testData.questions.length ) res2( testId );
        } )
        .catch( rej2 );
      } );
    } )
    .then( testId => res( {
      isSuccess : true,
      id : testId
    } ) )
    .catch( rej ) );
  }
}

module.exports = Tests;
