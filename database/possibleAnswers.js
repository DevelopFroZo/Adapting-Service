class PossibleAnswers{
  constructor( modules ){
    this.modules = modules;
  }

  async add( companyId, questionId, description, isRight ){
    let data, number, id;

    description = description.toLowerCase();

    data = await this.modules.questions.isCompanyQuestion( companyId, questionId );

    if( !data.isSuccess ) return data;

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
