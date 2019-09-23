/*
 *  Error codes:
 *   0 -- блок с переданным number уже существует
 */

class InfoBlocks{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, name, description, number ){
    let companyId, data, id;

    companyId = await this.modules.companies.isTokenValid( token );

    if( !companyId.isSuccess ) return companyId;

    companyId = companyId.id;

    data = await this.modules.db.query(
      "select id " +
      "from infoblocks " +
      "where companyid = $1 and number = $2",
      [ companyId, number ]
    );

    if( data.rowCount === 1 ) return {
      isSuccess : false,
      code : 0,
      message : "Info block with sended number already exists"
    };

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
