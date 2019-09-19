let requests, cookie;

async function companyAuthHandler(){
  let email, password;

  email = document.getElementById( "email" ).value;
  password = document.getElementById( "password" ).value;

  requests.post(
    "/companies/authorize",
    { email, password }
  )
  .then( data => {
    console.log( data );

    if( data.isSuccess ) cookie.set( "token", data.token );
  } )
  .catch( console.log );
}

async function addTestHandler(){
  let infoBlockId, testData;

  infoBlockId = document.getElementById( "infoBlockId" ).value;

  testData = {
    infoBlockId,
    questions : [
      {
        name : `Name 1 [${infoBlockId}]`,
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
        name : `Name 2 [${infoBlockId}]`,
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
        name : `Name 3 [${infoBlockId}]`,
        description : "Description 3",
        type : "variant",
        time : 6,
        number : 3,
        possibleAnswers : [
          {
            description : `Answer 1 [${infoBlockId}]`,
            isRight : false
          },
          {
            description : `Answer 2 [${infoBlockId}]`,
            isRight : true
          },
          {
            description : `Answer 3 [${infoBlockId}]`,
            isRight : false
          },
          {
            description : `Answer 4 [${infoBlockId}]`,
            isRight : true
          }
        ]
      }
    ]
  }

  requests.post(
    "/tests/add",
    testData
  )
  .then( console.log )
  .catch( console.log );
}

async function authHandler(){
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
  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();
  cookie.delete( "token" );

  document.getElementById( "companyAuthButton" ).addEventListener( "click", companyAuthHandler );
  document.getElementById( "addTestButton" ).addEventListener( "click", addTestHandler );
  document.getElementById( "authButton" ).addEventListener( "click", authHandler );
  document.getElementById( "getInfoBlockButton" ).addEventListener( "click", getInfoBlockHandler );
  document.getElementById( "getQuestionButton" ).addEventListener( "click", getQuestionHandler );
  document.getElementById( "sendAnswerButton" ).addEventListener( "click", sendAnswerHandler );
}

window.addEventListener( "load", index );
