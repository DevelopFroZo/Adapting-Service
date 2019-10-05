from connectSettings import getConnectSettings
from messages import getMessages
from responseHandler import errorHandler, succsessHandler
import telebot
import requests
import time


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
  # response = requests.post( 'http://{}/telegram/{}'.format(
  #   connectSettings[ 'databaseIp' ],
  #   path
  # ), data, timeout=1 )

  response = requests.post( 'http://{}/telegram/{}'.format(
    connectSettings[ 'databaseIp' ],
    path
  ), data, timeout=1 ).json()
  print( response )

  return response

# /start command
@bot.message_handler( commands = [ 'start' ] )
def start( message ):
  keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  keyboard.row( '/auth' )
  keyboard.row( '/help' )
  
  bot.send_message( message.chat.id, messages[ 'greeting' ] )
  bot.send_message( message.chat.id, messages[ 'info' ], reply_markup=keyboard )


# /help command 
@bot.message_handler( commands = [ 'help' ] )
def help( message ):
  bot.send_message( message.chat.id, messages[ 'help' ] )


# /auth command
@bot.message_handler( commands = ['auth'] )
def auth( message ):
  msg = bot.send_message( message.chat.id, messages[ 'auth' ] )
  bot.register_next_step_handler(msg, auth_ )


# /startTest command
@bot.message_handler( commands = [ 'startTest' ] )
def getTest( message ):

  response = getTestFromdb( message )

  if response == False:
    return False

  if response[ 'question' ][ 'type' ] == 'short':
    text = printTest( message, response )
    msg = bot.send_message( message.chat.id, '{}\n\n{}'.format(
      text,
      messages[ 'answerInfoShort' ]
    ) )
  elif response[ 'question' ][ 'type' ] == 'long':
    text = printTest( message, response )
    msg = bot.send_message( message.chat.id, '{}\n\n{}'.format(
      text,
      messages[ 'answerInfoLong' ]
      ) )
  elif response[ 'question' ][ 'type' ] == 'variant':
    keyboard = createVariantKeyboard( response )
    text = printTestVariant( message, response )
    msg = bot.send_message( message.chat.id, '{}\n\n{}'.format(
      text,
      messages[ 'answerInfoTest' ]
    ), reply_markup=keyboard )
  
  bot.register_next_step_handler( msg, textAnswerHandler )


# /info command
@bot.message_handler( commands = [ 'info' ] )
def getInfoBlock( message ):
  keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  keyboard.row( '/startTest' )

  response = post( 'getInfoBlock', { 'telegramId' : message.from_user.id } )

  if not response[ 'isSuccess' ] :
    bot.send_message( message.chat.id, errorHandler( response ) )
  else: 
    bot.send_message( message.chat.id, 'Тема: {}\n\n{}\n\n{}'.format( 
      response[ 'infoBlock' ][ 'name' ],
      response[ 'infoBlock' ][ 'description' ],
      messages[ 'infoStartTest' ]
    ), reply_markup=keyboard )


# default message handler
@bot.message_handler( content_types = [ 'text' ] )
def default( message ):
  response = post( 'getStatus', { 'telegramId' : message.from_user.id } )

  if response[ 'isSuccess' ]: 
    if response[ 'status' ] == 4:
      textAnswerHandler( message )
      return False

  bot.send_message( message.from_user.id, 'Я Вас не понимаю(' )


@bot.callback_query_handler( func=lambda call: True )
def callback_inline( call ):
  data = call.message.json[ 'reply_markup' ]
  keyboard = telebot.types.InlineKeyboardMarkup()
  answer = ""
  

  if call.data == 'send':
    for elem in data[ 'inline_keyboard' ]:
      for el in elem:
        if el[ 'callback_data' ] != 'send':
          if int( el[ 'callback_data' ] ) < 0:
            answer += str( int( el[ 'callback_data' ] ) * -1 ) + ' '

    print( call.message.date )
    print( call.message.edit_date )

    response = post( 'sendAnswer', {
      'telegramId' : call.from_user.id,
      'answer' : answer.strip(),
      'time' : call.message.edit_date
    } )

    if not response[ 'isSuccess' ]:
      bot.send_message( call.from_user.id, errorHandler( response ) )
    else: 
      bot.send_message( call.from_user.id, succsessHandler( response ) )
    getTestFromdb( call.message )
    return True

  for elem in data[ 'inline_keyboard' ]:
    button = []
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

  bot.edit_message_text( chat_id=call.message.chat.id, message_id=call.message.message_id, text=call.message.text, reply_markup=keyboard )


def auth_( message ):
  if message.text.lower() == 'отмена' :
    bot.send_message( message.chat.id, 'Авториация отменена' )
    return False

  msg = message.text.split( ',' )

  keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  keyboard.row( 'Отмена' )

  if len(msg) == 2:
    data = {
      'companyName' : msg[0].strip(),
      'key' : msg[1].strip(),
      'telegramId' : message.from_user.id
    }

    response = post( 'authorize', data )

  else:
    msg = bot.send_message( message.chat.id, messages[ 'incorrectAuthData' ], reply_markup=keyboard )
    bot.register_next_step_handler( msg, auth_ )
    return

  if not response[ 'isSuccess' ] :
    if response[ 'code' ] != 2:
      msg = bot.send_message( message.chat.id, '{}, повторите попытку или напишите "Отмена"'.format(
        errorHandler( response )
      ), reply_markup=keyboard )
      bot.register_next_step_handler( msg, auth_ )
    elif response[ 'code' ] == 2:
      msg = bot.send_message( message.chat.id, errorHandler( response ) )
  else:
    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
    keyboard.row( '/info' )
    keyboard.row( '/help' )

    bot.send_message( message.chat.id, messages[ 'successAuth' ].format(
      response[ 'name' ]
    ), reply_markup=keyboard )


def printTest( message, test ):
  return '{}) {}'.format(
    test[ 'question' ][ 'number' ],
    test[ 'question' ][ 'description' ]
  ) 


def printTestVariant( message, test ):
  answers = ''

  for i in range( len( test[ 'possibleAnswers' ] ) ):
    answers += '{}) {}\n\n'.format( 
      i+1, 
      test[ 'possibleAnswers' ][ i ][ 'description' ] )
  
  question = '{}) {}\n\n{}'.format(
    test[ 'question' ][ 'number' ],
    test[ 'question' ][ 'description' ],
    answers
  ) 

  return question


def getTestFromdb( message ):
  response = post( 'getQuestion', {
    'telegramId' : message.from_user.id
  } )


  if not response[ 'isSuccess' ]:
    if response[ 'code' ] == '0':
      keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
      keyboard.row( '/info' )
      bot.send_message( message.from_user.id, errorHandler( response ), reply_markup=keyboard )
    else:
      bot.send_message( message.from_user.id, errorHandler( response ) )
    return False

  post( 'acceptQuestion', {
    'telegramId' : message.from_user.id,
    'time' : message.date
  } )

  return response


def textAnswerHandler( message ):
  response = post( 'sendAnswer', {
    'telegramId' : message.from_user.id,
    'answer' : message.text,
    'time' : message.date
  } )

  if not response[ 'isSuccess' ]:
    bot.send_message( message.chat.id, errorHandler( response ) )
  else: 
    bot.send_message( message.chat.id, succsessHandler( response ) )

  getTest( message )

def createVariantKeyboard( test ):
  keyboard = telebot.types.InlineKeyboardMarkup()

  length = len( test[ 'possibleAnswers' ] )
  
  for i in range( length ):
    if ( i + 1 ) == length: 
      button = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i+1 ), callback_data='{}'.format( i+1 ) )
      keyboard.row( button )
      continue
    if i % 2 == 0:
      button1 = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i+1 ), callback_data='{}'.format( i+1 ) )
    else:
      button2 = telebot.types.InlineKeyboardButton( text='Ответ {}'.format( i+1 ), callback_data='{}'.format( i+1 ) )
      keyboard.row( button1, button2 )
  
  button1 = telebot.types.InlineKeyboardButton( text='Отправить ответ', callback_data='send' )
  keyboard.row( button1 )

  return keyboard

def checkBot():
  try:
    bot.polling()
  except:
    bot.stop_polling()
    checkBot() 


print( 'Try to run bot with proxy {}:{}'.format(
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ] ) )
bot.polling()
# checkBot()