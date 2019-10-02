class InfoBlocks{
  constructor( modules ){
    this.modules = modules;
  }

  async add( companyId, name, description ){
    let number, id;

    number = await this.modules.db.query(
      "select number + 1 as number " +
      "from infoblocks " +
      "where companyid = $1 " +
      "order by number desc " +
      "limit 1",
      [ companyId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await this.modules.db.query(
      "insert into infoblocks( name, description, companyid, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ name, description, companyId, number ]
    ) ).rows[0].id;

    return {
      isSuccess : true,
      id
    };
  }

  async isCompanyInfoBlock( companyId, infoBlockId ){
    let data;

    data = await this.modules.db.query(
      "select companyid = $1 as iscompanyinfoblock " +
      "from infoblocks " +
      "where id = $2",
      [ companyId, infoBlockId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : "Info block doesn't exists"
    };
    else if( !data.rows[0].iscompanyinfoblock ) return {
      isSuccess : false,
      code : 1,
      message : "Info block doesn't belong to the company"
    };
    else return { isSuccess : true }
  }

  async edit( companyId, infoBlockId, fields ){
    let data, fields_, fills, count;

    data = await this.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    fields_ = [];
    fills = [];
    count = 1;

    for( let field in fields ) if(
      [ "name", "description" ].indexOf( field ) > -1
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
    fills.push( infoBlockId )

    await this.modules.db.query(
      "update infoblocks " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return { isSuccess : true };
  }
}

module.exports = InfoBlocks;
