function getTest(){
    return(
        {
            test : {
              name : "Тест по правильному мытью посуды",
              description : "Данный тест показывает нам, как сильно вы разбираетесь в мытье посуды. Пройдите этот тест полностью без ошибок, иначе Вы будете уволены!"
            },
            questions : [
              {
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
                description : "Description 3",
                type : "variant",
                time : 6,
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
          
    )
}