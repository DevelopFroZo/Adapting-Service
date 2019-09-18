function getTest(){
    return(
        {
            test : {
              name : "Тест по правильному мытью посуды",
              description : "Данный тест показывает нам, как сильно вы разбираетесь в мытье посуды. Пройдите этот тест полностью без ошибок, иначе Вы будете уволены!"
            },
            questions : [
              {
                name : "Name 1",    
                description : "Description 1",
                type : "short",
                time : 1,
                number: 1,
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
                number: 2,
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
                number: 3,
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