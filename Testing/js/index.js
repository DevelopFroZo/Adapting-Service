let requests;

async function authButtonHandler(){
  let companyName, telegramId, key;

  companyName = document.getElementById( "companyName" ).value;
  telegramId = document.getElementById( "telegramId" ).value;
  key = document.getElementById( "key" ).value;

  console.log( await requests.post(
    "/telegram/authorize",
    { companyName, key, telegramId }
  ) );
}

async function getInfoBlockHandler(){
  let telegramId;

  telegramId = document.getElementById( "telegramId" ).value;

  console.log( await requests.post(
    "/telegram/getInfoBlock",
    { telegramId }
  ) );
}

async function getQuestionHandler(){
  let telegramId, data;

  telegramId = document.getElementById( "telegramId" ).value;

  data = await requests.post(
    "/telegram/getQuestion",
    { telegramId }
  );

  console.log( data );

  if( data.isSuccess ) requests.post(
    "/telegram/acceptQuestion",
    { telegramId }
  );
}

async function sendAnswerHandler(){
  let telegramId, answer;

  telegramId = document.getElementById( "telegramId" ).value;
  answer = document.getElementById( "answer" ).value;

  console.log( await requests.post(
    "/telegram/sendAnswer",
    { telegramId, answer }
  ) );
}

function index(){
  let cookie, testData;

  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();
  cookie.delete( "token" );

  document.getElementById( "authButton" ).addEventListener( "click", authButtonHandler );
  document.getElementById( "getInfoBlockButton" ).addEventListener( "click", getInfoBlockHandler );
  document.getElementById( "getQuestionButton" ).addEventListener( "click", getQuestionHandler );
  document.getElementById( "sendAnswerButton" ).addEventListener( "click", sendAnswerHandler );

  // Authorize & test add testing
  testData = {
    infoBlockId : 1,
    questions : [
      {
        name : "Name 1",
        description : "Description 1",
        type : "short",
        time : 1,
        number : 1,
        possibleAnswers : [
          {
            description : "Answer 1",
            isRight : true
          }
        ]
      },
      {
        name : "Name 2",
        description : "Description 2",
        type : "long",
        time : 2,
        number : 2,
        possibleAnswers : [
          {
            description : "Very big answer for this question",
            isRight : true
          }
        ]
      },
      {
        name : "Name 3",
        description : "Description 3",
        type : "variant",
        time : 6,
        number : 3,
        possibleAnswers : [
          {
            description : "Answer 1",
            isRight : false
          },
          {
            description : "Answer 2",
            isRight : true
          },
          {
            description : "Answer 3",
            isRight : false
          },
          {
            description : "Asnwer 4",
            isRight : true
          }
        ]
      }
    ]
  }

  // requests.post(
  //   "/companies/authorize", {
  //     email : "example@example.com",
  //     password : "123456"
  //   }
  // )
  // .then( data => {
  //   if( !data.isSuccess ) console.log( data );
  //   else{
  //     cookie.set( "token", data.token );
  //     console.log( `Authorized "${data.token}"` );
  //
  //     return requests.post(
  //       "/tests/add",
  //       testData
  //     );
  //   }
  // } )
  // .then( console.log )
  // .catch( console.log );
}

window.addEventListener( "load", index );
