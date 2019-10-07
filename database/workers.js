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
}

module.exports = Workers;
