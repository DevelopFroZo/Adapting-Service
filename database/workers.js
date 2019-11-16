let BaseDatabase;

BaseDatabase = require( "./support/baseDatabase" );

class Workers extends BaseDatabase{
  constructor( modules, codes ){
    super( modules, codes, "Workers" );
  }

  async create( companyId, name ){
    let code, transaction, id;

    code = await this.modules.codes.getRandom();

    if( !code.ok ) return code;

    code = code.data;
    transaction = await super.transaction();

    await transaction.query(
      "delete " +
      "from codes " +
      "where code = $1",
      [ code ]
    );
    id = ( await transaction.query(
      "insert into workers( name, key, companyid ) " +
      "values( $1, $2, $3 ) " +
      "returning id",
      [ name, code, companyId ]
    ) ).rows[0].id;
    await transaction.end();

    return super.success( 8, { id, code } );
  }

  async isCompanyWorker( companyId, workerId ){
    let data;

    data = await super.query(
      "select companyid = $1 as iscompanyworker " +
      "from workers " +
      "where id = $2",
      [ companyId, workerId ]
    );

    if( data.rowCount === 0 ) return super.error( 6 );
    else if( !data.rows[0].iscompanyworker ) return super.error( 7 );

    return super.success( 6 );
  }

  async delete( companyId, workerId ){
    let data, transaction;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    transaction = await super.transaction( "delete" );
    await transaction.query(
      "delete " +
      "from workers " +
      "where id = $1",
      [ workerId ]
    );
    await transaction.query(
      "delete " +
      "from blockstoworkers " +
      "where workerid = $1",
      [ workerId ]
    );
    await transaction.query(
      "delete " +
      "from workersstates " +
      "where workerid = $1",
      [ workerId ]
    );
    await transaction.end();

    return super.success( 7 );
  }

  async getAll( companyId ){
    let workers;

    workers = await super.query(
      "select id, name, key " +
      "from workers " +
      "where companyid = $1",
      [ companyId ]
    );

    if( workers.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, workers.rows );
  }

  async getCompanyWorkerIds( companyId, workerIds ){
    let data;

    workerIds = workerIds.join( ", " );
    data = ( await super.query(
      "select id " +
      "from workers " +
      "where" +
      "   companyid = $1 and" +
      `   id in ( ${workerIds} )`,
      [ companyId ]
    ) ).rows;

    data = data.map( el => el = el.id );

    return data;
  }

  async getSubscriptionsOrUnsubscriptionIds( workerId, infoBlockIds, mode ){
    let data;

    data = ( await super.query(
      "select infoblockid " +
      "from blockstoworkers " +
      "where" +
      `   infoblockid in ( ${infoBlockIds.join( ", " )} ) and` +
      "   workerid = $1",
      [ workerId ]
    ) ).rows;

    data = data.map( el => el = el.infoblockid );
    infoBlockIds = infoBlockIds.filter(
      infoBlockId => ( mode && data.includes( infoBlockId ) ) ||
      ( !mode && !data.includes( infoBlockId ) )
    );

    return infoBlockIds;
  }

  async subscribe( companyId, workerId, infoBlockIds ){
    let data, query;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    infoBlockIds = await this.modules.infoBlocks.getCompanyInfoBlockIds( companyId, infoBlockIds );

    if( infoBlockIds.length === 0 ) return super.success( 9 );

    infoBlockIds = await this.getSubscriptionsOrUnsubscriptionIds( workerId, infoBlockIds, false );

    if( infoBlockIds.length === 0 ) return super.success( 9 );

    query =
      "insert into blockstoworkers( infoblockid, workerid ) " +
      "values ";
    infoBlockIds.map( infoBlockId => query += `( ${infoBlockId}, ${workerId} ), ` );
    query = query.slice( 0, query.length - 2 );
    await super.query( query );

    return super.success( 9 );
  }

  async unsubscribe( companyId, workerId, infoBlockIds ){
    let data, query;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    infoBlockIds = await this.modules.infoBlocks.getCompanyInfoBlockIds( companyId, infoBlockIds );

    if( infoBlockIds.length === 0 ) return super.success( 10 );

    infoBlockIds = await this.getSubscriptionsOrUnsubscriptionIds( workerId, infoBlockIds, true );

    if( infoBlockIds.length === 0 ) return super.success( 10 );

    infoBlockIds = infoBlockIds.join( ", " );
    await super.query(
      "delete " +
      "from blockstoworkers " +
      "where" +
      `   infoblockid in ( ${infoBlockIds} ) and` +
      "   workerid = $1",
      [ workerId ]
    );

    return super.success( 10 );
  }

  async getSubscriptions( companyId, workerId ){
    let data, subscriptions;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    subscriptions = await super.query(
      "select ib.id " +
      "from" +
      "   blockstoworkers as btw," +
      "   infoblocks as ib " +
      "where" +
      "   btw.infoblockid = ib.id and" +
      "   btw.workerid = $1",
      [ workerId ]
    );

    if( subscriptions.rowCount === 0 ) return super.error( 8 );

    return super.success( 4, subscriptions.rows );
  }

  async getAnswers( companyId, workerId, infoBlockId ){
    let data, workerAnswers, possibleAnswers, groupedWorkerAnswers, groupedPossibleAnswers, fl;

    data = await this.isCompanyWorker( companyId, workerId );

    if( !data.ok ) return data;

    data = await this.modules.infoBlocks.isCompanyInfoBlock( companyId, infoBlockId );

    if( !data.ok ) return data;

    workerAnswers = await super.query(
      "select questionid, answer, isright, number " +
      "from workersanswers " +
      "where" +
      "   questionid in (" +
      "     select id" +
      "     from questions" +
      "     where" +
      "       workerid = $1 and" +
      "       infoblockid = $2" +
      "   ) " +
      "order by number, questionid",
      [ workerId, infoBlockId ]
    );

    if( workerAnswers.rowCount === 0 ) return super.error( 8 );

    workerAnswers = workerAnswers.rows;
    possibleAnswers = ( await super.query(
      "select" +
      "   pa.questionid," +
      "   q.description as questiondescription," +
      "   pa.description as possibleanswerdescription," +
      "   pa.isright," +
      "   pa.number " +
      "from" +
      "   possibleanswers as pa," +
      "   questions as q " +
      "where" +
      "   pa.questionid in (" +
      "     select id" +
      "     from questions" +
      "     where infoblockid = $1" +
      "   ) and" +
      "   pa.questionid = q.id " +
      "order by number, questionid",
      [ infoBlockId ]
    ) ).rows;

    groupedWorkerAnswers = [];
    groupedPossibleAnswers = [];

    workerAnswers.map( workerAnswer => {
      fl = true;

      for( let i = 0; i < groupedWorkerAnswers.length && fl; i++ )
        if( groupedWorkerAnswers[i][0].questionid === workerAnswer.questionid ){
          groupedWorkerAnswers[i].push( workerAnswer );
          fl = false;
        }

      if( fl ) groupedWorkerAnswers.push( [ workerAnswer ] );
    } );

    possibleAnswers.map( possibleAnswer => {
      fl = true;

      for( let i = 0; i < groupedPossibleAnswers.length && fl; i++ )
        if( groupedPossibleAnswers[i][0].questionid === possibleAnswer.questionid ){
          groupedPossibleAnswers[i].push( possibleAnswer );
          fl = false;
        }

      if( fl ) groupedPossibleAnswers.push( [ possibleAnswer ] );
    } );

    return super.success( 4, { groupedPossibleAnswers, groupedWorkerAnswers } );
  }
}

module.exports = Workers;
