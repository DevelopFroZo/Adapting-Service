class Workers{
  constructor( modules ){
    this.modules = modules;
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
