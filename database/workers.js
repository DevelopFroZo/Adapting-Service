let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class Workers extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Workers" );
  }

  async create( companyId, name ){
    let code, transaction, id;

    code = await this.modules.codes.getRandom();

    if( !code.ok ) return code;

    code = code.data;
    transaction = await super.transaction();

    await transaction.query(
      "delete " +
      "from codes " +
      "where code = $1",
      [ code ]
    );
    id = ( await transaction.query(
      "insert into workers( name, key, companyid ) " +
      "values( $1, $2, $3 ) " +
      "returning id",
      [ name, code, companyId ]
    ) ).rows[0].id;
    await transaction.end();

    return super.success( 8, id );
  }

  async getAll( companyId ){
    let workers;

    workers = await super.query(
      "select id, name " +
      "from workers " +
      "where companyid = $1",
      [ companyId ]
    );

    if( workers.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, workers.rows );
  }

  async isCompanyWorker( companyId, workerId ){
    let data;

    data = await super.query(
      "select companyid = $1 as iscompanyworker " +
      "from workers " +
      "where id = $2",
      [ companyId, workerId ]
    );

    if( data.rowCount === 0 ) return super.error( 6 );
    else if( !data.rows[0].iscompanyworker ) return super.error( 7 );

    return super.success( 6 );
  }

  async subscribe( companyId, infoBlockId, workerId ){
    let data;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    data = await super.query(
      "select infoblockid " +
      "from blockstoworkers " +
      "where" +
      "   infoblockid = $1 and" +
      "   workerid = $2",
      [ infoBlockId, workerId ]
    );

    if( data.rowCount === 1 ) return super.error( 9 );

    await super.query(
      "insert into blockstoworkers( infoblockid, workerid ) " +
      "values( $1, $2 )",
      [ infoBlockId, workerId ]
    );

    return super.success( 9 );
  }

  async unsubscribe( companyId, infoBlockId, workerId ){
    let data;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    data = await super.query(
      "select infoblockid " +
      "from blockstoworkers " +
      "where" +
      "   infoblockid = $1 and" +
      "   workerid = $2",
      [ infoBlockId, workerId ]
    );

    if( data.rowCount === 0 ) return super.error( 10 );

    await super.query(
      "delete " +
      "from blockstoworkers " +
      "where" +
      "   infoblockid = $1 and" +
      "   workerid = $2",
      [ infoBlockId, workerId ]
    );

    return super.success( 10 );
  }

  async getSubscribers( companyId, infoBlockId ){
    let data, subscribers;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    subscribers = await super.query(
      "select w.id, w.name " +
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

module.exports = Workers;
