/*
 *  Error codes:
 *   0 -- блок с переданным ID не существует
 */

class Questions{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, infoBlockId, name, description, type, time ){
    let companyId, data, number, id;

    companyId = await this.modules.companies.isTokenValid( token );

    if( !companyId.isSuccess ) return companyId;

    companyId = companyId.id;

    data = await this.modules.db.query(
      "select id " +
      "from infoblocks " +
      "where id = $1",
      [ infoBlockId ]
    );

    if( data.rowCount === 0 ) return {
      isSuccess : false,
      code : 0,
      message : "Block with sended ID doesn't exists"
    };

    number = await this.modules.db.query(
      "select number + 1 as number " +
      "from questions " +
      "where infoblockid = $1 " +
      "order by number desc " +
      "limit 1",
      [ infoBlockId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await this.modules.db.query(
      "insert into questions( infoblockid, name, description, type, time, number ) " +
      "values( $1, $2, $3, $4, $5, $6 ) " +
      "returning id",
      [ infoBlockId, name, description, type, time, number ]
    ) ).rows[0].id;

    return {
      isSuccess : true,
      id
    };
  }
}

module.exports = Questions;
