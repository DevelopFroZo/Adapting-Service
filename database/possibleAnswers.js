class PossibleAnswers{
  constructor( modules ){
    this.modules = modules;
  }

  add( token, questionId, answerData ){
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
            "insert into possibleanswers( questionid, description, isright ) " +
            "values( $1, $2, $3 ) " +
            "returning id",
            [ questionId, answerData.description, answerData.isRight ]
          );
        } )
        .then( data => res( {
          isSuccess : true,
          id : data.rows[0].id
        } ) )
        .catch( rej )
    );
  }
}

function index( modules ){
  return new PossibleAnswers( modules );
}

module.exports = index;
