from responseHandler import errorHandler, succsessHandler, codeHandler
from connectSettings import getConnectSettings
from messages import getMessages
import requests
import telebot
import json

connectSettings = getConnectSettings()
telebot.apihelper.proxy = {
    'https' : 'socks5h://{}:{}@{}:{}'.format(
    connectSettings[ 'proxy' ][ 'login' ],
    connectSettings[ 'proxy' ][ 'password' ],
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ]
  )
}
bot = telebot.TeleBot( connectSettings[ 'token' ], threaded=False )

messages = getMessages()


def post( path, data ):
    headers = {
        'Content-type': 'application/json'
        }

    response = requests.post( 'http://{}/telegram/{}'.format(
        connectSettings[ 'databaseIp' ],
        path
    ),
    json=data )

    try:
        response = response.json()
        
        print( '\n\n\n' + path )
        print( response )

        return response
    except requests.exceptions.Timeout as e:
        print( 'RESPONSE TIMEOUT ERROR!!!\n{}'.format( e ) )
    except requests.exceptions.RequestException as e:
        print( 'RESPONSE ERROR!!!:\n{}'.format( e ) )


def sendMessage( id, message, reply_markup=None, parse_mode=None ):
    try:
        msg = bot.send_message( id, message, reply_markup=reply_markup, parse_mode=parse_mode )
        return msg
    except telebot.apihelper.ApiException as e:
        result_dict = json.loads(e.result.text) 
        description = result_dict['description'] 
        if description == "bot was blocked by the user": 
            raise 
        else: 
            print("err")
            pass
        return None


def editMessage( chat_id, message_id, text, reply_markup, parse_mode ):
    # print( text )
    try:
        msg = bot.edit_message_text( chat_id=chat_id, message_id=message_id, text=text, reply_markup=reply_markup, parse_mode=parse_mode )
    # bot.edit_message_reply_markup( chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=keyboard )
        return msg
    except telebot.apihelper.ApiException as e:
        print( 'ERROR!!!: \n{}'.format( e ) )
        return None


# Bot /start command handler
@bot.message_handler( commands = [ 'start' ] )
def start( message ):
    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
    keyboard.row( '/auth' )
    keyboard.row( '/help' )

    sendMessage( message.chat.id, messages[ 'greeting' ] )
    sendMessage( message.chat.id, messages[ 'info' ], reply_markup=keyboard )


# Bot /help command handler
@bot.message_handler( commands = [ 'help' ] )
def help( message ):
    sendMessage( message.chat.id, messages[ 'help' ] )


# Bot /auth command handler
@bot.message_handler( commands = [ 'auth' ] )
def auth( message ):
    msg = sendMessage( message.chat.id, messages[ 'auth' ] )
    bot.register_next_step_handler( msg, authHandler )


def authHandler( message ):
    if message.text.lower() == 'отмена':
        sendMessage( message.chat.id, 'Авторизация отменена' )
        return False
    
    msg = message.text.split( ',' )
    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )

    if len( msg ) == 2:
        response = post( 'authorize', {
            'companyName' : msg[0].strip(),
            'key' : msg[1].strip(),
            'telegramId' : message.chat.id
        } )
    else:
        msg = sendMessage( message.chat.id, messages[ 'incorrectAuthData' ], reply_markup=keyboard )
        bot.register_next_step_handler( msg, authHandler )
        return

    if not response[ 'ok' ]:
        if response[ 'code' ] != 5:
            keyboard.row( 'Отмена' )
            msg = sendMessage( message.chat.id, '{}, повторите попытку или напишите "Отмена"'.format(
                codeHandler( response )
            ), reply_markup=keyboard )

            bot.register_next_step_handler( msg, authHandler )
        elif response[ 'code' ] == 5:
            keyboard.row( '/info' )
            keyboard.row( '/help' )

            sendMessage( message.chat.id, codeHandler( response ), reply_markup=keyboard )
    else:
        keyboard.row( '/info' )
        keyboard.row( '/help' )

        sendMessage( message.chat.id, messages[ 'successAuth' ].format(
            response[ 'data' ]
        ), reply_markup=keyboard, parse_mode="Markdown" )


# Bot /info commands handler
@bot.message_handler( commands = [ 'info' ] )
def infoBlock( message ):
    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
    keyboard.row( '/startTest' )

    response = post( 'getInfoBlock', {
        'telegramId' : message.chat.id
    } )

    if not response[ 'ok' ]: 
        sendMessage( message.chat.id, codeHandler( response ) )
    else:
        sendMessage( message.chat.id, 'Тема: {}\n\n{}\n\n{}'.format(
            response[ 'data' ][ 'name' ],
            response[ 'data' ][ 'description' ],
            messages[ 'infoStartTest' ] 
        ), reply_markup=keyboard, parse_mode="Markdown" )


# Bot /startTest commands handler
@bot.message_handler( commands = [ 'startTest' ] )
def test( message ):
    printTestMessage( message )


def printTestMessage( message ):
    response = getTestFromdb( message )

    if response == False:
        return False
    
    if response[ 'data' ][ 'question' ][ 'type' ] == 'short':
        text = printTest( message, response )
        msg = sendMessage( message.chat.id, '{}\n\n{}'.format(
            text,
            messages[ 'answerInfoShort' ]
        ), parse_mode="Markdown" )
        bot.register_next_step_handler( msg, sendShortOrLongAnswer )
    elif response[ 'data' ][ 'question' ][ 'type' ] == 'long':
        text = printTest( message, response )
        msg = sendMessage( message.chat.id, '{}\n\n{}'.format(
            text,
            messages[ 'answerInfoLong' ]
        ), parse_mode="Markdown" )
        bot.register_next_step_handler( msg, sendShortOrLongAnswer )
    elif response[ 'data' ][ 'question' ][ 'type' ] == 'many variant':
        keyboard = createManyVariantKeyboard( response )
        text = printTestVariant( message, response )
        msg = sendMessage( message.chat.id, '{}\n\n{}'.format(
            text,
            messages[ 'answerInfoManyVariant' ]
        ), reply_markup=keyboard, parse_mode="Markdown" )
    elif response[ 'data' ][ 'question' ][ 'type' ] == 'one variant':
        keyboard = createOneVariantKeyboard( response )
        text = printTestVariant( message, response )
        msg = sendMessage( message.chat.id, '{}\n\n{}'.format(
            text,
            messages[ 'answerInfoOneVariant' ]
        ), reply_markup=keyboard, parse_mode="Markdown" )

def getTestFromdb( message ):
    response = post( 'getQuestion', {
        'telegramId' : message.chat.id
    } )

    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )

    if not response[ 'ok' ]:
        sendMessage( message.chat.id, codeHandler( response ) )
        return False
    else:
        if response[ 'code' ] == 4:
            keyboard.row( '/info' )
            sendMessage( message.chat.id, codeHandler( response ), reply_markup=keyboard )
            return False
        elif response[ 'code' ] == 7:
            sendMessage( message.chat.id, codeHandler( response ) )

    post( 'acceptQuestion', {
        'telegramId' : message.chat.id
    } )

    return response


def printTest( message, test ):
    return '{}) {}\n\n⏳*{}*⏳'.format(
        test[ 'data' ][ 'question' ][ 'number' ],
        test[ 'data' ][ 'question' ][ 'description' ],
        getTime( test[ 'data' ][ 'question' ][ 'time' ] )
    )


def printTestVariant( message, test ):
    answer = ''

    for i in range( len( test[ 'data' ][ 'possibleAnswers' ] ) ):
        answer += '{}) {}\n\n'.format(
            i+1,
            test[ 'data' ][ 'possibleAnswers' ][ i ][ 'description' ]
        )

    question = '{}) {}\n\n{}\n⏳*{}*⏳'.format(
        test[ 'data' ][ 'question' ][ 'number' ],
        test[ 'data' ][ 'question' ][ 'description' ],
        answer,
        getTime( test[ 'data' ][ 'question' ][ 'time' ] )
    )

    return question


def getTime( time ):
    e = int( time ) % 10
    if int( time ) <= 20 & e > 4:
        return 'На ответ отведено {} минут'.format( time )
    if e == 1:
        return 'На ответ отведена {} минута'.format( time )
    if e > 1 & e < 5:
        return 'На ответ отведено {} минуты'.format( time )
    if e > 4:
        return 'На ответ отведено {} минут'.format( time )


def createManyVariantKeyboard( test ):
    keyboard = telebot.types.InlineKeyboardMarkup()

    data = test[ 'data' ][ 'possibleAnswers' ] 
    length = len( data )
    i = 0

    for i in range( length ):
        if i % 2 == 0:
            button1 = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i + 1 ), callback_data='{}'.format( data[i][ 'id' ] ) )
            if i == ( length - 1 ):
                keyboard.row( button1 )
                continue
        else:
            button2 = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i + 1 ), callback_data='{}'.format( data[i][ 'id' ] ) )
            keyboard.row( button1, button2 )
  
    button1 = telebot.types.InlineKeyboardButton( text='Отправить ответ', callback_data='send' )
    keyboard.row( button1 )

    return keyboard


def createOneVariantKeyboard( test ):
    keyboard = telebot.types.InlineKeyboardMarkup()

    data = test[ 'data' ][ 'possibleAnswers' ] 
    length = len( data )
    i = 0

    for i in range( length ):
        if i % 2 == 0:
            button1 = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i + 1 ), callback_data='{}'.format( data[i][ 'id' ] ) )
            if i == ( length - 1 ):
                keyboard.row( button1 )
                continue
        else:
            button2 = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i + 1 ), callback_data='{}'.format( data[i][ 'id' ] ) )
            keyboard.row( button1, button2 )

    return keyboard



@bot.callback_query_handler( func=lambda call: True )
def callback_inline( call ):
    data = call.message.json[ 'reply_markup' ]

    if data == None:
        return False

    keyboard = telebot.types.InlineKeyboardMarkup()
        
    isOneVariant = True

    for elem in data[ 'inline_keyboard' ]:
        for el in elem:
            if el[ 'callback_data' ] == 'send':
                isOneVariant = False

    if not isOneVariant:
        answer = []

        if call.data == 'send':
            for elem in data[ 'inline_keyboard' ]:
                for el in elem:
                    if el[ 'callback_data' ] != 'send':
                        if int( el[ 'callback_data' ] ) < 0:
                            answer.append( ( int( el[ 'callback_data' ] ) * -1 ) )
                
            if len( answer ) == 1:
                sendMessage( call.message.chat.id, 'Вы выбрали только один ответ, выберите ещё' )
                return False

            response = post( 'sendVariantAnswer', {
                'telegramId' : call.message.chat.id,
                'possibleAnswerIds' : answer
            } )

            sendMessage( call.message.chat.id, codeHandler( response ) )

            text = editText( call.message.text )

            editMessage( chat_id=call.message.chat.id, message_id=call.message.message_id, text=text, reply_markup=keyboard, parse_mode="Markdown" )
            printTestMessage( call.message )
            return True
            
        button = []

        for elem in data[ 'inline_keyboard' ]:
            for el in elem:
                if call.data == el[ 'callback_data' ]:
                    callbackData = int( el[ 'callback_data' ] ) * -1
                    if int( call.data ) > 0:
                        but = telebot.types.InlineKeyboardButton( text='✅ '+el[ 'text' ], callback_data=callbackData )
                    else:
                        but = telebot.types.InlineKeyboardButton( text=el[ 'text' ][ 2: ], callback_data=callbackData )   
                else:
                    callbackData = el[ 'callback_data' ]
                    but = telebot.types.InlineKeyboardButton( text=el[ 'text' ], callback_data=callbackData )
                button.append( but )
            
            if len( button ) > 1:
                keyboard.row( button[0], button[1] )
            else:
                keyboard.row( button[0] )
            button = []

        text = editText( call.message.text )

        editMessage( chat_id=call.message.chat.id, message_id=call.message.message_id, text=text, reply_markup=keyboard, parse_mode="Markdown" )
    else:
        text = editText( call.message.text )

        msg = editMessage( chat_id=call.message.chat.id, message_id=call.message.message_id, text=text, reply_markup=keyboard, parse_mode="Markdown" )
      
        if msg != None:
            response = post( 'sendVariantAnswer', {
                'telegramId' : call.message.chat.id,
                'possibleAnswerIds' :  ( int( call.data ), )
            } )
            
            sendMessage( call.message.chat.id, codeHandler( response ) )
            printTestMessage( call.message )
            return True
        else:
            return False


def editText( text ):
    text = text.split( '⏳' )
    text[1] = '⏳*{}*⏳'.format( text[1] )

    return ''.join( text )


def sendShortOrLongAnswer( message ):
    response = post( 'sendShortOrLongAnswer', {
        'telegramId' : message.chat.id,
        'answer' : message.text
    } )

    if not response[ 'ok' ]:
        sendMessage( message.chat.id, codeHandler( response ) )
    else:
        sendMessage( message.chat.id, codeHandler( response ) )

    test( message )


# Bot default message handler
@bot.message_handler( content_types = [ 'text' ] )
def default( message ):
    # print( message )
    # response = post( 'getStatus', {
    #     'telegramId' : message.chat.id
    # } )

    # if response[ 'ok' ]:
    #     if response[ 'code' ] == 1:
    #         sendShortOrLongAnswer( message )
    #         return False
    
    # bot.reply_to(message, "Howdy, how are you doing?")
    sendMessage( message.chat.id, 'Я вас не понимаю(' )
    # except telebot.apihelper.ApiException as e:
        # if 'blocked by user' in e.result:
            # pass 


def checkBot():
    try:
        bot.polling()
    except:
        bot.stop_polling()
        checkBot()


print( 'Run bot with proxy {}:{}'. format(
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ]
) )

try:
    bot.polling()
except telebot.apihelper.ApiException as e:
    result_dict = json.loads(e.result.text) 
    description = result_dict['description'] 
    if description == "bot was blocked by the user": 
        raise 
    else: 
        print("err")
        pass
