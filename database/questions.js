let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class Questions extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Questions" );
  }

  async add( companyId, infoBlockId, description, type, time ){
    let data, number, id;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    number = await super.query(
      "select number + 1 as number " +
      "from questions " +
      "where infoblockid = $1 " +
      "order by number desc " +
      "limit 1",
      [ infoBlockId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await super.query(
      "insert into questions( infoblockid, description, type, time, number ) " +
      "values( $1, $2, $3, $4, $5 ) " +
      "returning id",
      [ infoBlockId, description, type, time, number ]
    ) ).rows[0].id;

    return super.success( 5, id );
  }

  async isCompanyQuestion( companyId, questionId ){
    let data;

    data = await super.query(
      "select ib.companyid = $1 as iscompanyquestion " +
      "from questions as q, infoblocks as ib " +
      "where" +
      "   q.infoblockid = ib.id and" +
      "   q.id = $2",
      [ companyId, questionId ]
    );

    if( data.rowCount === 0 ) return super.error( 6 );
    else if( !data.rows[0].iscompanyquestion ) return super.error( 7 );

    return super.success( 6 );
  }

  async delete( companyId, questionId ){
    let data, transaction;

    data = await this.isCompanyQuestion( companyId, questionId );

    if( !data.ok ) return data;

    transaction = await super.transaction();
    data = ( await transaction.query(
      "delete " +
      "from questions " +
      "where id = $1 " +
      "returning infoblockid, number",
      [ questionId ]
    ) ).rows[0];
    await transaction.query(
      "update questions " +
      "set number = number - 1 " +
      "where" +
      "   infoblockid = $1 and" +
      "   number > $2",
      [ data.infoblockid, data.number ]
    );
    await transaction.query(
      "delete " +
      "from possibleanswers " +
      "where questionid = $1",
      [ questionId ]
    );
    await transaction.end();

    return super.success( 7 );
  }

  async edit( companyId, questionId, fields ){
    let data, fields_, fills, count;

    data = await this.isCompanyQuestion( companyId, questionId );

    if( !data.ok ) return data;

    fields_ = [];
    fills = [];
    count = 1;

    for( let field in fields ) if(
      [ "description", "type", "time" ].indexOf( field ) > -1
    ){
      fields_.push( `${field} = $${count}` );
      fills.push( fields[ field ] );
      count++;
    }

    if( fields_.length === 0 ) return super.error( 5 );

    fields_ = fields_.join( ", " );
    fills.push( questionId )

    await super.query(
      "update questions " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return super.success( 3 );
  }

  async checkLongQuestions( companyId, workerId, data ){
    let data_, goodMarks, badMarks, transaction;

    data_ = await this.modules.workers.isCompanyWorker( companyId, workerId );

    if( !data_.ok ) return data_;

    goodMarks = [];
    badMarks = [];

    data.map( el => {
      if( el.isRight ) goodMarks.push( el.questionId );
      else badMarks.push( el.questionId );
    } );

    transaction = await super.transaction();

    if( goodMarks.length > 0 )
      await transaction.query(
        "update workersanswers " +
        "set isright = true " +
        "where" +
        "   questionid in(" +
        "     select q.id" +
        "     from" +
        "       workersanswers as wa," +
        "       questions as q," +
        "       infoblocks as ib" +
        "     where" +
        "       wa.questionid = q.id and" +
        "       q.infoblockid = ib.id and" +
        "       ib.companyid = $1 and" +
        "       q.type = 'long' and" +
        "       wa.isright is null and" +
        `       q.id in ( ${goodMarks.join( ", " )} )` +
        "   ) and" +
        "   workerid = $2",
        [ companyId, workerId ]
      );

    if( badMarks.length > 0 )
      await transaction.query(
        "update workersanswers " +
        "set isright = false " +
        "where" +
        "   questionid in(" +
        "     select q.id" +
        "     from" +
        "       workersanswers as wa," +
        "       questions as q," +
        "       infoblocks as ib" +
        "     where" +
        "       wa.questionid = q.id and" +
        "       q.infoblockid = ib.id and" +
        "       ib.companyid = $1 and" +
        "       q.type = 'long' and" +
        "       wa.isright is null and" +
        `       q.id in ( ${badMarks.join( ", " )} )` +
        "   ) and" +
        "   workerid = $2",
        [ companyId, workerId ]
      );

    await transaction.end();

    return super.success( 11 );
  }
}

module.exports = Questions;
