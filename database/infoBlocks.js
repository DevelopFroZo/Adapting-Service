class InfoBlocks{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, name, description, number ){
    let data, id;

    data = await this.modules.companies.isTokenValid( token );

    if( !data.isSuccess ) return company;

    id = ( await this.modules.db.query(
      "insert into infoblocks( name, description, companyid, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ name, description, data.id, number ]
    ) ).rows[0].id;

    return {
      isSuccess : true,
      id
    };
  }
}

module.exports = InfoBlocks;
