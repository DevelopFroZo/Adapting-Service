class Requests{
  constructor( options ){
    if( !isObject( options ) ) return;

    if( isString( options.dataType ) )
      this.dataType = options.dataType;

    this.responsePreprocess =
      isFunction( options.responsePreprocess ) ?
      options.responsePreprocess :
      null;
  }

  onLoad( xhr, method, res, rej, data ){
    if( xhr.status === 200 ){
      let responseText;


      if( this.responsePreprocess )
        responseText = this.responsePreprocess( xhr.responseText );
      else responseText = xhr.responseText;

      res( responseText );
    } else {
      let options;

      options = {
        method,
        URL : xhr.responseURL,
        status : xhr.status,
        statusText : xhr.statusText
      };

      if( !isUndefined( data ) ) options.data = data;

      rej( options );
    }
  }

  send( method, URL, data ){
    return new Promise( ( res, rej ) => {
      let xhr;

      xhr = new XMLHttpRequest();
      xhr.addEventListener( "load", () => {
        if( isUndefined( data ) || isNull( data ) || isNaN( data ) )
          this.onLoad( xhr, method, res, rej );
        else this.onLoad( xhr, method, res, rej, data );
      } );
      xhr.open( method, URL );

      if( isUndefined( data ) || isNull( data ) || isNaN_( data ) ) xhr.send();
      else{
        if( this.dataType ) switch( this.dataType ){
          case "json":
            xhr.setRequestHeader( "content-type", "application/json" );
            data = JSON.stringify( data );
          break;
        }

        xhr.send( data );
      }
    } );
  }

  get( URL ){
    return this.send( "GET", URL );
  }

  post( URL, data ){
    return this.send( "POST", URL, data );
  }
}
