class InfoBlocks{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, name, description ){
    let companyId, number, id;

    companyId = await this.modules.companies.isTokenValid( token );

    if( !companyId.isSuccess ) return companyId;

    companyId = companyId.id;

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
}

module.exports = InfoBlocks;
