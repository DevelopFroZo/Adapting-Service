let requests, cookie;

async function companyAuthHandler(){
  let emailOrLogin, password, data;

  emailOrLogin = document.getElementById( "emailOrLogin" ).value;
  password = document.getElementById( "password" ).value;

  data = await requests.post(
    "/companies/authorize",
    { emailOrLogin, password }
  );

  console.log( data );

  if( data.isSuccess ) cookie.set( "token", data.token );
}

async function addTestHandler(){
  let infoBlockId, testData, data, data2;//questions, possibleAnswers, data, data2;

  infoBlockId = document.getElementById( "infoBlockId" ).value;

  // questions = [
  //   {
  //     name : `Name 1 [${infoBlockId}]`,
  //     description : "Description 1",
  //     type : "short",
  //     time : 1
  //   },
  //   {
  //     name : `Name 2 [${infoBlockId}]`,
  //     description : "Description 2",
  //     type : "long",
  //     time : 2
  //   },
  //   {
  //     name : `Name 3 [${infoBlockId}]`,
  //     description : "Description 3",
  //     type : "variant",
  //     time : 6
  //   }
  // ];
  //
  // possibleAnswers = [
  //   [ {
  //     description : "Answer 1",
  //     isRight : true
  //   } ],
  //   [ {
  //     description : "Very big answer for this question",
  //     isRight : true
  //   } ],
  //   [
  //     {
  //       description : `Answer 1 [${infoBlockId}]`,
  //       isRight : false
  //     },
  //     {
  //       description : `Answer 2 [${infoBlockId}]`,
  //       isRight : true
  //     },
  //     {
  //       description : `Answer 3 [${infoBlockId}]`,
  //       isRight : false
  //     },
  //     {
  //       description : `Answer 4 [${infoBlockId}]`,
  //       isRight : true
  //     }
  //   ]
  // ];
  //
  // for( let i = 0; i < questions.length; i++ ){
  //   questions[i].infoBlockId = infoBlockId;
  //
  //   data = await requests.post(
  //     "/questions/add",
  //     questions[i]
  //   );
  //
  //   if( !data.isSuccess ){
  //     console.log( data );
  //
  //     return;
  //   }
  //
  //   for( let j = 0; j < possibleAnswers[i].length; j++ ){
  //     possibleAnswers[i][j].questionId = data.id;
  //     possibleAnswers[i][j].description = possibleAnswers[i][j].description.toLowerCase();
  //
  //     data2 = await requests.post(
  //       "/possibleAnswers/add",
  //       possibleAnswers[i][j]
  //     );
  //
  //     if( !data2.isSuccess ){
  //       console.log( data2 );
  //
  //       return;
  //     }
  //   }
  // }
  //
  // console.log( "Success" );
  testData = {
    "infoBlock" : {
      "name" : "\"Опросник\" после 1 недели стажировки ASVT",
      "description" : "",
      "number" : 1
    },
    "questions" : [
      {
        "description" : "Чем отличается услуга ВО от ВАТС?",
        "type" : "variant",
        "time" : 1,
        "possibleAnswers" : [
          {
            "description" : "Исходящая Связь",
            "isRight" : true
          },
          {
            "description" : "Интеграция",
            "isRight" : true
          },
          {
            "description" : "Названием",
            "isRight" : true
          },
          {
            "description" : "Ничем",
            "isRight" : false
          },
          {
            "description" : "Функционал одинаковый, цены разные",
            "isRight" : false
          }
        ]
      },
      {
        "description" : "Каким образом клиент Связьтранзит может заказать и установить голосовое приветствие на номер?",
        "type" : "variant",
        "time" : 1,
        "possibleAnswers" : [
          {
            "description" : "Личный кабинет",
            "isRight" : false,
          },
          {
            "description" : "Почта",
            "isRight" : false,
          },
          {
            "description" : "Звонок",
            "isRight" : false,
          },
          {
            "description" : "Телеграм",
            "isRight" : false,
          },
          {
            "description" : "Все ответы верны",
            "isRight" : true
          }
        ]
      },
      {
        "description" : "Сможем ли мы подключить клиенту услуги телефонной связи на канале оператора Дом.ру?",
        "type" : "variant",
        "time" : 1,
        "possibleAnswers" : [
          {
            "description" : "Да",
            "isRight" : true
          },
          {
            "description" : "Нет",
            "isRight" : false
          }
        ]
      },
      {
        "description" : "Как будет происходить подключение рабочих мест у клиента, если у него установлены аналоговые телефонные аппараты?",
        "type" : "long",
        "time" : 3,
        "possibleAnswers" : [
          {
            "description" : "Честно, я не знаю, что правильно, поэтому я просто написал сюда что-то",
            "isRight" : true
          },
        ]
      },
      {
        "description" : "Что такое Хот-спот? для чего он нужен?",
        "type" : "long",
        "time" : 3,
        "possibleAnswers" : [
          {
            "description" : "Тут я тоже без понятия, что правильно",
            "isRight" : true
          },
        ]
      },
      {
        "description" : "Какие виды распределения звонков вы знаете?",
        "type" : "variant",
        "time" : 1,
        "possibleAnswers" : [
          {
            "description" : "Справедливое",
            "isRight" : true
          },
          {
            "description" : "Равномерное",
            "isRight" : true
          },
          {
            "description" : "Ровное",
            "isRight" : false
          },
          {
            "description" : "Прямое",
            "isRight" : false
          },
          {
            "description" : "Последовательное",
            "isRight" : true
          }
        ]
      },
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

    if( !data.isSuccess ){
      console.log( data );

      break;
    }

    console.log( `Question ${i + 1} added [${data.id}]` );

    for( let j = 0; j < testData.questions[i].possibleAnswers.length; j++ ){
      data2 = await requests.post(
        "/possibleAnswers/add",
        {
          questionId : data.id,
          description : testData.questions[i].possibleAnswers[j].description,
          isRight : testData.questions[i].possibleAnswers[j].isRight
        }
      );

      if( !data2.isSuccess ){
        console.log( data2 );

        return;
      }

      console.log( `  Possible answer ${j + 1} added [${data2.id}]` );
    }
  }
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
}

window.addEventListener( "load", index );
