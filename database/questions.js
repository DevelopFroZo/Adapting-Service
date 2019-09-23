/*
 *  Error codes:
 *   0 -- блок с переданным ID не существует
 *   1 -- вопрос с переданным number уже существует
 */

class Questions{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, infoBlockId, name, description, type, time, number ){
    let companyId, data, id;

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

    data = await this.modules.db.query(
      "select id " +
      "from questions " +
      "where infoblockid = $1 and number = $2",
      [ infoBlockId, number ]
    );

    if( data.rowCount === 1 ) return {
      isSuccess : false,
      code : 1,
      message : "Question with sended number already exists"
    };

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
