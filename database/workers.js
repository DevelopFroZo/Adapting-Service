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

    return super.success( 8, { id, code } );
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

  async delete( companyId, workerId ){
    let data, transaction;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    transaction = await super.transaction( "delete" );
    await transaction.query(
      "delete " +
      "from workers " +
      "where id = $1",
      [ workerId ]
    );
    await transaction.query(
      "delete " +
      "from blockstoworkers " +
      "where workerid = $1",
      [ workerId ]
    );
    await transaction.query(
      "delete " +
      "from workersstates " +
      "where workerid = $1",
      [ workerId ]
    );
    await transaction.end();

    return super.success( 7 );
  }

  async getAll( companyId ){
    let workers;

    console.log( companyId );

    workers = await super.query(
      "select id, name, key " +
      "from workers " +
      "where companyid = $1",
      [ companyId ]
    );

    if( workers.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, workers.rows );
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

  async getSubscriptions( companyId, workerId ){
    let data, subscriptions;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    subscriptions = await super.query(
      "select ib.id " +
      "from" +
      "   blockstoworkers as btw," +
      "   infoblocks as ib " +
      "where" +
      "   btw.infoblockid = ib.id and" +
      "   btw.workerid = $1",
      [ workerId ]
    );

    if( subscriptions.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, subscriptions.rows );
  }
}

module.exports = Workers;
