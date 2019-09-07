function index(){
  let requests, cookie;

  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();

  requests
    .post( "/companies/authorize", {
      email : "example@example.com",
      password : "123456"
    } )
    .then( data => {
      if( !data.isSuccess ){
        alert( data.error );

        return;
      }

      cookie.set( "token", data.token );
      console.log( "Logged successfully" );
    } )
    .catch( console.log );
}

window.addEventListener( "load", index );
