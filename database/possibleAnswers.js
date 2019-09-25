/*
 *  Error codes:
 *   0 -- вопрос с переданным ID не существует
 */

class PossibleAnswers{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, questionId, description, isRight ){
    let data, number, id;

    description = description.toLowerCase();
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

    number = await this.modules.db.query(
      "select number + 1 as number " +
      "from possibleanswers " +
      "where questionid = $1 " +
      "order by number desc " +
      "limit 1",
      [ questionId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await this.modules.db.query(
      "insert into possibleanswers( questionid, description, isright, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ questionId, description, isRight, number ]
    ) ).rows[0].id;

    return {
      isSuccess : true,
      id
    };
  }
}

module.exports = PossibleAnswers;
