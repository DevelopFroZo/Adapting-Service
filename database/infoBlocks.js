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
      code : -2,
      message : "Info block doesn't exists"
    };
    else if( !data.rows[0].iscompanyinfoblock ) return {
      isSuccess : false,
      code : -2,
      message : "Info block doesn't belong to the company"
    };
    else return { isSuccess : true }
  }

  async delete( companyId, infoBlockId ){
    let data, client, tmp;

    data = await this.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      data = ( await client.query(
        "delete " +
        "from infoblocks " +
        "where id = $1 " +
        "returning companyid, number",
        [ infoBlockId ]
      ) ).rows[0];
      await client.query(
        "update infoblocks " +
        "set number = number - 1 " +
        "where" +
        "   companyid = $1 and" +
        "   number > $2",
        [ data.companyid, data.number ]
      );
      data = ( await client.query(
        "delete " +
        "from questions " +
        "where infoblockid = $1 " +
        "returning id",
        [ infoBlockId ]
      ) ).rows;

      if( data.length > 0 ){
        tmp = [];
        data.map( el => tmp.push( el.id ) );
        tmp = tmp.join( ", " );

        await client.query(
          "delete " +
          "from possibleanswers " +
          `where questionid in ( ${tmp} )`
        );
      }

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        code : -2
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -2,
        message : "Problems with database (InfoBlocks.delete)"
      };
    }
  }

  async getAll( companyId ){
    let infoBlocks;

    infoBlocks = await this.modules.db.query(
      "select id, name, description, number " +
      "from infoblocks " +
      "where companyid = $1 " +
      "order by number",
      [ companyId ]
    );

    if( infoBlocks.rowCount === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Info blocks not found"
    };

    infoBlocks = infoBlocks.rows;

    return {
      isSuccess : true,
      code : -2,
      infoBlocks
    };
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
      code : -2,
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
