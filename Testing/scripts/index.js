function index(){
  let requests, cookie, testData;

  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();
  testData = {
    test : {
      name : "Test", // string
      description : "Description" // string
    },
    questions : [
      {
        name : "Name 1", // string
        description : "Description 1", // string
        type : "short", // string
        time : 1, // integer !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        answers : [ "Answer 1", true ] // array !!!!!!!!!!!!!!!!!!!!!!!!
      },
      {
        name : "Name 2", // string
        description : "Description 2", // string
        type : "long", // string
        time : 2, // integer
        answers : [ "Very big answer for this question", true ] // array
      },
      {
        name : "Name 3", // string
        description : "Description 3", // string
        type : "variant", // string
        time : 6, // integer
        answers : [ // array
          [ "Answer 1", false ],
          [ "Answer 2", true ],
          [ "Answer 3", false ],
          [ "Asnwer 4", true ]
        ]
      }
    ]
  }

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
      console.log( `Authorized "${data.token}"` );

      requests
        .post(
           "/tests/add",
           testData
         )
        .then( console.log )
        .catch( console.log );
    } )
    .catch( console.log );
}

window.addEventListener( "load", index );
