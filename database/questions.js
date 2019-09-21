class Questions{
  constructor( modules ){
    this.modules = modules;
  }

  async add( token, infoBlockId, name, description, type, time, number ){
    let data, id;

    data = await this.modules.companies.isTokenValid( token );

    if( !data.isSuccess ) return data;

    id = await this.modules.db.query(
      "select id " +
      "from infoblocks " +
      "where id = $1",
      [ infoBlockId ]
    );

    if( id.rowCount === 0 ) return {
      isSuccess : false,
      error : "Блок с переданным ID не существует"
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
