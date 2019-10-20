let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class InfoBlocks extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "InfoBlocks" )
  }

  async add( companyId, name, description ){
    let number, id;

    number = await super.query(
      "select number + 1 as number " +
      "from infoblocks " +
      "where companyid = $1 " +
      "order by number desc " +
      "limit 1",
      [ companyId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await super.query(
      "insert into infoblocks( name, description, companyid, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ name, description, companyId, number ]
    ) ).rows[0].id;

    return super.success( 5, id );
  }

  async isCompanyInfoBlock( companyId, infoBlockId ){
    let data;

    data = await super.query(
      "select companyid = $1 as iscompanyinfoblock " +
      "from infoblocks " +
      "where id = $2",
      [ companyId, infoBlockId ]
    );

    if( data.rowCount === 0 ) return super.error( 6 );
    else if( !data.rows[0].iscompanyinfoblock ) return super.error( 7 );

    return super.success( 6 );
  }

  async delete( companyId, infoBlockId ){
    let data, transaction, tmp;

    data = await this.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    transaction = await super.transaction( "delete" );
    data = ( await transaction.query(
      "delete " +
      "from infoblocks " +
      "where id = $1 " +
      "returning companyid, number",
      [ infoBlockId ]
    ) ).rows[0];
    await transaction.query(
      "update infoblocks " +
      "set number = number - 1 " +
      "where" +
      "   companyid = $1 and" +
      "   number > $2",
      [ data.companyid, data.number ]
    );
    data = ( await transaction.query(
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

      await transaction.query(
        "delete " +
        "from possibleanswers " +
        `where questionid in ( ${tmp} )`
      );
    }

    await transaction.query(
      "delete " +
      "from blockstoworkers " +
      "where infoblockid = $1",
      [ infoBlockId ]
    );
    await transaction.end();

    return super.success( 7 );
  }

  async getAll( companyId ){
    let infoBlocks;

    infoBlocks = await super.query(
      "select id, name, description, number " +
      "from infoblocks " +
      "where companyid = $1 " +
      "order by number",
      [ companyId ]
    );

    if( infoBlocks.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, infoBlocks.rows );
  }

  async edit( companyId, infoBlockId, fields ){
    let data, fields_, fills, count;

    data = await this.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

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

    if( fields_.length === 0 ) return super.error( 5 );

    fields_ = fields_.join( ", " );
    fills.push( infoBlockId )

    await super.query(
      "update infoblocks " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return super.success( 3 );
  }

  async getSubscribers( companyId, infoBlockId ){
    let data, subscribers;

    data = await this.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    subscribers = await super.query(
      "select w.id " +
      "from" +
      "   blockstoworkers as btw," +
      "   workers as w " +
      "where" +
      "   btw.workerid = w.id and" +
      "   btw.infoblockid = $1",
      [ infoBlockId ]
    );

    if( subscribers.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, subscribers.rows );
  }
}

module.exports = InfoBlocks;
