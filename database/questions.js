class Questions{
  constructor( modules ){
    this.modules = modules;
  }

  async add( companyId, infoBlockId, description, type, time ){
    let data, number, id;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    number = await this.modules.db.query(
      "select number + 1 as number " +
      "from questions " +
      "where infoblockid = $1 " +
      "order by number desc " +
      "limit 1",
      [ infoBlockId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await this.modules.db.query(
      "insert into questions( infoblockid, description, type, time, number ) " +
      "values( $1, $2, $3, $4, $5 ) " +
      "returning id",
      [ infoBlockId, description, type, time, number ]
    ) ).rows[0].id;

    return {
      isSuccess : true,
      id
    };
  }

  async isCompanyQuestion( companyId, questionId ){
    let data;

    data = await this.modules.db.query(
      "select ib.companyid = $1 as iscompanyquestion " +
      "from questions as q, infoblocks as ib " +
      "where" +
      "   q.infoblockid = ib.id and" +
      "   q.id = $2",
      [ companyId, questionId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Question doesn't exists"
    };
    else if( !data.rows[0].iscompanyquestion ) return {
      isSuccess : false,
      code : -2,
      message : "Question doesn't belong to the company"
    };

    return { isSuccess : true };
  }

  async edit( companyId, questionId, fields ){
    let data, fields_, fills, count;

    data = await this.isCompanyQuestion( companyId, questionId );

    if( !data.isSuccess ) return data;

    fields_ = [];
    fills = [];
    count = 1;

    for( let field in fields ) if(
      [ "description", "type", "time" ].indexOf( field ) > -1
    ){
      fields_.push( `${field} = $${count}` );
      fills.push( fields[ field ] );
      count++;
    }

    if( fields_.length === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Invalid fields"
    };

    fields_ = fields_.join( ", " );
    fills.push( questionId )

    await this.modules.db.query(
      "update questions " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return { isSuccess : true };
  }
}

module.exports = Questions;
