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

  async isCompanyPossibleAnswer( companyId, possibleAnswerId ){
    let data;

    data = await this.modules.db.query(
      "select ib.companyid = $1 as iscompanypossibleanswer " +
      "from" +
      "   possibleanswers as pa," +
      "   questions as q," +
      "   infoblocks as ib " +
      "where" +
      "   pa.questionid = q.id and" +
      "   q.infoblockid = ib.id and" +
      "   pa.id = $2",
      [ companyId, possibleAnswerId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : "Possible answer doesn't exists"
    };
    else if( !data.rows[0].iscompanypossibleanswer ) return {
      isSuccess : false,
      code : 1,
      message : "Possible answer doesn't belong to the company"
    };

    return { isSuccess : true };
  }

  async edit( companyId, possibleAnswerId, fields ){
    let data, fields_, fills, count;

    data = await this.isCompanyPossibleAnswer( companyId, possibleAnswerId );

    if( !data.isSuccess ) return data;

    fields_ = [];
    fills = [];
    count = 1;

    for( let field in fields ) if(
      [ "description", "isRight" ].indexOf( field ) > -1
    ){
      fields_.push( `${field} = $${count}` );
      fills.push( fields[ field ] );
      count++;
    }

    if( fields_.length === 0 ) return {
      isSuccess : false,
      code : 2,
      message : "Invalid fields"
    };

    fields_ = fields_.join( ", " );
    fills.push( possibleAnswerId )

    await this.modules.db.query(
      "update possibleanswers " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return { isSuccess : true };
  }
}

module.exports = PossibleAnswers;
