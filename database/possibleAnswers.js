/*
 *  Error codes:
 *   0 -- вопрос с переданным ID не существует
 *   1 -- возможный ответ с переданным number уже существует
 */

class PossibleAnswers{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, questionId, description, isRight, number ){
    let data;

    data = await this.modules.companies.isTokenValid( token );

    if( !data.isSuccess ) return data;

    data = await this.modules.db.query(
      "select id " +
      "from questions " +
      "where id = $1",
      [ questionId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : "Question with sended ID doesn't exists"
    };

    data = await this.modules.db.query(
      "select id " +
      "from possibleanswers " +
      "where questionid = $1 and number = $2",
      [ questionId, number ]
    );

    if( data.rowCount === 1 ) return {
      isSuccess : false,
      code : 1,
      message : "Possible answer with sended number already exists"
    };

    data = await this.modules.db.query(
      "insert into possibleanswers( questionid, description, isright, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ questionId, description, isRight, number ]
    );

    return {
      isSuccess : true,
      id : data.rows[0].id
    };
  }
}

module.exports = PossibleAnswers;
