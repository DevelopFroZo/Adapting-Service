class Questions{
  constructor( modules ){
    this.modules = modules;
  }

  add( token, testId, questionData ){
    return new Promise( ( res, rej ) =>
      this.modules.companies
        .isTokenValid( token )
        .then( data => {
          if( !data ){
            res( {
              isSuccess : false,
              message : "Пользователь не авторизован"
            } );

            return;
          }

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

          return new Promise( ( res2, rej2 ) => {
            for( let i = 0; i < questionData.possibleAnswers.length; i++ )
              this.modules.possibleAnswers
                .add( token, questionId, questionData.possibleAnswers[i] )
                .then( () => {
                  c++;

                  if( c === questionData.possibleAnswers.length ) res2( questionId );
                } )
                .catch( rej2 );
          } );
        } )
        .then( questionId => res( {
          isSuccess : true,
          id : questionId
        } ) )
        .catch( rej )
    );
  }
}

function index( modules ){
  return new Questions( modules );
}

module.exports = index;
