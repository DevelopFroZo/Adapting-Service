function mySqlAsyncQuery( db, sql, data ){
  return new Promise( ( res, rej ) => {
    try{
      let data_, index, number;

      data_ = [];

      while( true ){
        index = sql.indexOf( "$" );

        if( index === -1 ) break;
        else if( data === undefined ) throw "Data array not correct";

        number = sql.slice( index + 1, sql.length ) + " ";
        number = parseInt( number.slice( 0, number.indexOf( " " ) ) ) - 1;

        if( isNaN( number ) ) throw "Parametr in sql string is incorrect";
        else if( number >= data.length ) throw "Data array not correct";

        data_.push( data[ number ] );
        sql = sql.replace( `$${number + 1}`, "?" );
      }

      db.query_(
        sql, data_, ( error, results, fields ) => {
          if( error ) throw error;

          let structure;

          structure = {
            rowCount : results.length,
            rows : results,
            fields
          };

          res( structure );
        }
      );
    }
    catch( error ){
      console.log( error );
    }
  } );
}

function mySqlAsyncPool( connectSettings ){
  let mySqlAsyncPool;

  mySqlAsyncPool = mySql.createPool( connectSettings );

  mySqlAsyncPool.query_ = mySqlAsyncPool.query;
  mySqlAsyncPool.query = ( sql, data ) => mySqlAsyncQuery( mySqlAsyncPool, sql, data );
  mySqlAsyncPool.connect = () => {
    return new Promise( ( res, rej ) => mySqlAsyncPool.getConnection( ( err, client ) => {
      if( err ) throw err;

      client.query_ = client.query;
      client.query = ( sql, data ) => mySqlAsyncQuery( client, sql, data );

      res( client );
    } ) );
  };

  return mySqlAsyncPool;
}
