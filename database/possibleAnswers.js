let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class PossibleAnswers extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "PossibleAnswers" );
  }

  async add( companyId, questionId, description, isRight ){
    let data, number, id;

    data = await this.modules.questions.isCompanyQuestion( companyId, questionId );

    if( !data.ok ) return data;

    number = await super.query(
      "select number + 1 as number " +
      "from possibleanswers " +
      "where questionid = $1 " +
      "order by number desc " +
      "limit 1",
      [ questionId ]
    );

    if( number.rowCount === 1 ) number = number.rows[0].number;
    else number = 1;

    id = ( await super.query(
      "insert into possibleanswers( questionid, description, isright, number ) " +
      "values( $1, $2, $3, $4 ) " +
      "returning id",
      [ questionId, description, isRight, number ]
    ) ).rows[0].id;

    return super.success( 5, id );
  }

  async isCompanyPossibleAnswer( companyId, possibleAnswerId ){
    let data;

    data = await super.query(
      "select ib.companyid = $1 as iscompanypossibleanswer " +
      "from" +
      "   possibleanswers as pa," +
      "   questions as q," +
      "   infoblocks as ib " +
      "where" +
      "   pa.questionid = q.id and" +
      "   q.infoblockid = ib.id and" +
      "   pa.id = $2",
      [ companyId, possibleAnswerId ]
    );

    if( data.rowCount === 0 ) return super.error( 6 );
    else if( !data.rows[0].iscompanypossibleanswer ) return super.error( 7 );

    return super.success( 6 );
  }

  async delete( companyId, possibleAnswerId ){
    let data, transaction;

    data = await this.isCompanyPossibleAnswer( companyId, possibleAnswerId );

    if( !data.ok ) return data;

    transaction = await super.transaction( "delete" );
    data = ( await transaction.query(
      "delete " +
      "from possibleanswers " +
      "where id = $1 " +
      "returning questionid, number",
      [ possibleAnswerId ]
    ) ).rows[0];
    await transaction.query(
      "update possibleanswers " +
      "set number = number - 1 " +
      "where" +
      "   questionid = $1 and" +
      "   number > $2",
      [ data.questionid, data.number ]
    );
    await transaction.end();

    return super.success( 7 );
  }

  async edit( companyId, possibleAnswerId, fields ){
    let data, fields_, fills, count;

    data = await this.isCompanyPossibleAnswer( companyId, possibleAnswerId );

    if( !data.ok ) return data;

    fields_ = [];
    fills = [];
    count = 1;

    for( let field in fields ) if(
      [ "description", "isRight" ].indexOf( field ) > -1
    ){
      fields_.push( `${field} = $${count}` );
      fills.push( fields[ field ] );
      count++;
    }

    if( fields_.length === 0 ) return super.error( 5 );

    fields_ = fields_.join( ", " );
    fills.push( possibleAnswerId )

    await super.query(
      "update possibleanswers " +
      `set ${fields_} ` +
      `where id = $${count}`,
      fills
    );

    return super.success( 3 );
  }
}

module.exports = PossibleAnswers;
