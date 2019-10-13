/*
 *  Error codes:
 *  0 -- заглушка
 *  1 -- проблемы с базой данных
 *  2 -- неверный telegram ID
 *  3 -- несоответствие статуса
 *  4 -- неверное название компании или неверный код авторизации
 *  5 -- работник уже авторизован
 *  6 -- информации для изучения больше нет
 *  7 -- истекло время на ответ
 *  8 -- один из ответов не содержит число
 *  9 -- работников со статусом 3 не найдено
 *
 *  Success codes:
 *  0 -- заглушка
 *  1 -- статус успешно получен
 *  2 -- работник успешно авторизован
 *  3 -- информация для изучения найдена
 *  4 -- тест пройден
 *  5 -- новый вопрос найден
 *  6 -- успешное подтверждение получения вопроса
 *  7 -- ответ успешно записан
 *  8 -- работники со статусом 3 найдены
 */

module.exports = {
  errors : {
     0 : "STUB",
     1 : "Problems with database",
     2 : "Invalid telegramId",
     3 : "Status mismatch",
     4 : "Invalid company name or authorize key",
     5 : "Worker already authorized",
     6 : "Info block not found",
     7 : "Answer timed out",
     8 : "One of answers doesn't contains number",
     9 : "Workers with status 3 not found"
  },
  successes : {
     0 : "STUB",
     1 : "Status founded",
     2 : "successfully authorized",
     3 : "Info block founded",
     4 : "Test passed",
     5 : "Next question founded",
     6 : "Question successfully accepted",
     7 : "Answer successfully added",
     8 : "Workers with status 3 founded"
  }
}
