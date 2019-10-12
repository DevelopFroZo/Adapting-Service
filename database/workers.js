class Workers{
  constructor( modules ){
    this.modules = modules;
  }

  async create( companyId, name ){
    let code, client, id;

    code = await this.modules.codes.getRandom();
    client = await this.modules.db.connect();

    try{
      await client.query( "begin" );

      await client.query(
        "delete " +
        "from codes " +
        "where code = $1",
        [ code ]
      );
      id = ( await client.query(
        "insert into workers( name, key, companyid ) " +
        "values( $1, $2, $3 ) " +
        "returning id",
        [ name, code, companyId ]
      ) ).rows[0].id;

      await client.query( "commit" );
      await client.release();

      return {
        isSuccess : true,
        code : -2,
        message : "Worker successfully created",
        id
      };
    }
    catch( error ){
      console.log( error );

      await client.query( "rollback" );
      await client.release();

      return {
        isSuccess : false,
        code : -1,
        message : "Problems with database (Workers.create)"
      };
    }
  }

  async getAll( companyId ){
    let workers;

    workers = await this.modules.db.query(
      "select id, name " +
      "from workers " +
      "where companyid = $1",
      [ companyId ]
    );

    if( workers.rowCount === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Workers not found"
    };

    workers = workers.rows;

    return {
      isSuccess : true,
      code : -2,
      workers
    };
  }

  async isCompanyWorker( companyId, workerId ){
    let data;

    data = await this.modules.db.query(
      "select companyid = $1 as iscompanyworker " +
      "from workers " +
      "where id = $2",
      [ companyId, workerId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Worker doesn't exists"
    };
    else if( !data.rows[0].iscompanyworker ) return {
      isSuccess : false,
      code : -2,
      message : "Worker doesn't belong to the company"
    };
    else return { isSuccess : true };
  }

  async subscribe( companyId, infoBlockId, workerId ){
    let data;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.isSuccess ) return data;

    data = await this.modules.db.query(
      "select infoblockid " +
      "from blockstoworkers " +
      "where" +
      "   infoblockid = $1 and" +
      "   workerid = $2",
      [ infoBlockId, workerId ]
    );

    if( data.rowCount === 1 ) return {
      isSuccess : false,
      code : -2,
      message : "Worker already subscribed"
    };

    await this.modules.db.query(
      "insert into blockstoworkers( infoblockid, workerid ) " +
      "values( $1, $2 )",
      [ infoBlockId, workerId ]
    );

    return {
      isSuccess : true,
      code : -2,
      message : "Worker successfully subscribed"
    };
  }

  async unsubscribe( companyId, infoBlockId, workerId ){
    let data;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.isSuccess ) return data;

    data = await this.modules.db.query(
      "select infoblockid " +
      "from blockstoworkers " +
      "where" +
      "   infoblockid = $1 and" +
      "   workerid = $2",
      [ infoBlockId, workerId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Worker doesn't subscribed"
    };

    await this.modules.db.query(
      "delete " +
      "from blockstoworkers " +
      "where" +
      "   infoblockid = $1 and" +
      "   workerid = $2",
      [ infoBlockId, workerId ]
    );

    return {
      isSuccess : true,
      code : -2,
      message : "Worker successfully unsubscribed"
    };
  }

  async getSubscribers( companyId, infoBlockId ){
    let data, subscribers;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.isSuccess ) return data;

    subscribers = await this.modules.db.query(
      "select w.id, w.name " +
      "from" +
      "   blockstoworkers as btw," +
      "   workers as w " +
      "where" +
      "   btw.workerid = w.id and" +
      "   btw.infoblockid = $1",
      [ infoBlockId ]
    );

    if( subscribers.rowCount === 0 ) return {
      isSuccess : false,
      code : -2,
      message : "Subscribed workers not found"
    };

    subscribers = subscribers.rows;

    return {
      isSuccess : true,
      code : -2,
      subscribers
    };
  }
}

module.exports = Workers;
