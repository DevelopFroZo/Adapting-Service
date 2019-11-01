def codeHandler( response ):
    if response[ 'ok' ]:
        res = succsessHandler( response )
    else:
        res = errorHandler( response )
    
    return res

def errorHandler( response ):
    error = {
        '0' : 'А шо случилосc? А случилосс ошибкус!',
        '1' : 'Проблема с базой данных',
        '2' : 'Неверный Telegram id',
        '3' : 'Неверный статус',
        '4' : 'Неверное название компании или код авторизации',
        '5' : 'Работник уже авторизован',
        '6' : 'Все темы пройдены',
        '7' : 'Истекло время на ответ',
        '8' : 'Ответ не содержит число',
        '9' : 'Нет работникаов со статусом 3'
    }

    return error[ str( response[ 'code' ] ) ]

def succsessHandler( response ):
    succes = {
        '0' : 'А шо случилосc?',
        '1' : 'Статус получен',
        '2' : 'Работник авторизован',
        '3' : 'Есть информация для изучения',
        '4' : 'Тест пройден',
        '5' : 'Есть вопрос',
        '6' : 'Подтверждение получения вопроса',
        '7' : 'Ответ принят',
        '8' : 'Найден работник со статусом 3'
    }

    return succes[ str( response[ 'code' ] ) ]
