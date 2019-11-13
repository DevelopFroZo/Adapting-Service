let requests, cookie, questionType;

async function companyAuthHandler(){
  let emailOrLogin, password, data;

  emailOrLogin = document.getElementById( "emailOrLogin" ).value;
  password = document.getElementById( "password" ).value;

  data = await requests.post(
    "/companies/authorize",
    { emailOrLogin, password }
  );

  console.log( data );

  if( data.ok ) cookie.set( "token", data.data );
}

async function addTestHandler(){
  let infoBlockId, testData, data, data2;

  infoBlockId = document.getElementById( "infoBlockId" ).value;

  testData = {
    questions : [
      {
        name : `Name 1 [${infoBlockId}]`,
        description : "Description 1",
        type : "short",
        time : 1,
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
  };

  for( let i = 0; i < testData.questions.length; i++ ){
    data = await requests.post(
      "/questions/add",
      {
        infoBlockId,
        description : testData.questions[i].description,
        type : testData.questions[i].type,
        time : testData.questions[i].time
      }
    );

    if( !data.ok ){
      console.log( data );

      break;
    }

    console.log( `Question ${i + 1} added [${data.data}]` );

    for( let j = 0; j < testData.questions[i].possibleAnswers.length; j++ ){
      data2 = await requests.post(
        "/possibleAnswers/add",
        {
          questionId : data.data,
          description : testData.questions[i].possibleAnswers[j].description,
          isRight : testData.questions[i].possibleAnswers[j].isRight
        }
      );

      if( !data2.ok ){
        console.log( data2 );

        return;
      }

      console.log( `  Possible answer ${j + 1} added [${data2.data}]` );
    }
  }
}

async function authHandler(){
  let companyNameOrLogin, telegramId, key;

  companyNameOrLogin = document.getElementById( "companyNameOrLogin" ).value;
  telegramId = document.getElementById( "telegramId" ).value;
  key = document.getElementById( "key" ).value;

  console.log( await requests.post(
    "/telegram/authorize",
    { companyNameOrLogin, key, telegramId }
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

  if( !data.ok ) return;

  questionType = data.data.question.type;
  data = await requests.post(
    "/telegram/acceptQuestion",
    { telegramId }
  );
}

async function sendAnswerHandler(){
  let telegramId, answer;

  telegramId = document.getElementById( "telegramId" ).value;
  answer = document.getElementById( "answer" ).value;

  if( questionType.indexOf( "variant" ) > -1 )
    console.log( await requests.post(
      "/telegram/sendVariantAnswer",
      {
        telegramId,
        possibleAnswerIds : [ 3, 5 ]
      }
    ) );
  else console.log( await requests.post(
    "/telegram/sendShortOrLongAnswer",
    {
      telegramId,
      answer
    }
  ) );
}

async function index(){
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

  // console.log( await requests.post(
  //   "/secret/refill"
  // ) );
}

window.addEventListener( "load", index );
