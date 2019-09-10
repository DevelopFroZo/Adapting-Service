class BaseDatabaseModule{
  constructor( modules, trace ){
    this.modules = modules;
    this.trace = trace;
  }

  getFatalData( error, trace ){
    return {
      isFatal : true,
      error,
      trace : `${this.trace}.${trace}`,
      message : "Some problems with database. Check server side"
    };
  }

  getSuccessOrErrorData( isSuccess, data ){
    let data_;

    data_ = { isSuccess : isSuccess };
    Object.keys( data ).map( key => data_[ key ] = data[ key ] );

    return data_;
  }

  promise( function_ ){
    return new Promise( ( res, rej ) => {
      return new Promise( ( res2, rej2 ) => {
        function_(
          ( data ) => res2( this.getSuccessOrErrorData( true, data ) ),
          ( data ) => {
            throw this.getSuccessOrErrorData( false, data );
          },
          ( error, trace ) => {
            if( error.isSuccess === undefined ) rej2( this.getFatalData( error, trace ) );
            else rej2( error );
          }
        );
      } )
      .then( res )
      .catch( error => {
        if( !error.isFatal ) res( error );
        else{
          console.log( error );

          res( {
            isFatal : true,
            error : error.message
          } );
        }
      } );
    } );
  }
}

module.exports = BaseDatabaseModule;
