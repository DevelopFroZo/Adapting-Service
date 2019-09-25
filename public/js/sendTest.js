function sendTest(){
  let requests, cookie, testData;

  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();
  testData = saveClick();

  requests.post(
    "/companies/authorize",
    {
      email : "example@example.com",
      password : "123456"
    }
  )
  .then( data => {
    if( !data ){
      console.log( data.message );

      return;
    }

    cookie.set( "token", data.token );
    console.log( `Authorized ${data.token}` );

    return requests.post(
      "/tests/add",
      testData
    );
  } )
  .then( console.log )
  .catch( console.log );

  /*requests.post(
    "/tests/add",
    testData
  )
  .then( console.log )
  .catch( console.log );*/
}

function index(){
  document.getElementById( "save-test" ).addEventListener( "click", sendTest );
}

window.addEventListener( "load", index );
