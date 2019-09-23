let requests, cookie;

async function companyAuthHandler(){
  let email, password, data;

  email = document.getElementById( "email" ).value;
  password = document.getElementById( "password" ).value;

  data = await requests.post(
    "/companies/authorize",
    { email, password }
  );

  console.log( data );

  if( data.isSuccess ) cookie.set( "token", data.token );
}

async function addTestHandler(){
  let infoBlockId, questions, possibleAnswers, data, data2;

  infoBlockId = document.getElementById( "infoBlockId" ).value;

  questions = [
    {
      name : `Name 1 [${infoBlockId}]`,
      description : "Description 1",
      type : "short",
      time : 1,
      number : 1
    },
    {
      name : `Name 2 [${infoBlockId}]`,
      description : "Description 2",
      type : "long",
      time : 2,
      number : 2
    },
    {
      name : `Name 3 [${infoBlockId}]`,
      description : "Description 3",
      type : "variant",
      time : 6,
      number : 3,
    }
  ];

  possibleAnswers = [
    [ {
      description : "Answer 1",
      isRight : true,
      number : 1
    } ],
    [ {
      description : "Very big answer for this question",
      isRight : true,
      number : 1
    } ],
    [
      {
        description : `Answer 1 [${infoBlockId}]`,
        isRight : false,
        number : 1
      },
      {
        description : `Answer 2 [${infoBlockId}]`,
        isRight : true,
        number : 2
      },
      {
        description : `Answer 3 [${infoBlockId}]`,
        isRight : false,
        number : 3
      },
      {
        description : `Answer 4 [${infoBlockId}]`,
        isRight : true,
        number : 4
      }
    ]
  ];

  for( let i = 0; i < questions.length; i++ ){
    questions[i].infoBlockId = infoBlockId;

    data = await requests.post(
      "/questions/add",
      questions[i]
    );

    if( !data.isSuccess ){
      console.log( data );

      return;
    }

    for( let j = 0; j < possibleAnswers[i].length; j++ ){
      possibleAnswers[i][j].questionId = data.id;
      possibleAnswers[i][j].description = possibleAnswers[i][j].description.toLowerCase();

      data2 = await requests.post(
        "/possibleAnswers/add",
        possibleAnswers[i][j]
      );

      if( !data2.isSuccess ){
        console.log( data2 );

        return;
      }
    }
  }

  console.log( "Success" );
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

  if( data.isSuccess ) await requests.post(
    "/telegram/acceptQuestion",
    {
      telegramId,
      time : 100
    }
  );
}

async function sendAnswerHandler(){
  let telegramId, answer;

  telegramId = document.getElementById( "telegramId" ).value;
  answer = document.getElementById( "answer" ).value;

  console.log( await requests.post(
    "/telegram/sendAnswer",
    {
      telegramId,
      answer,
      time : 200
    }
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