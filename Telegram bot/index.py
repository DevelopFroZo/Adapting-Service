from connectSettings import getConnectSettings
from messages import getMessages
import telebot
import requests


connectSettings = getConnectSettings()
telebot.apihelper.proxy = {
  'https' : 'socks5h://{}:{}@{}:{}'.format(
    connectSettings[ 'proxy' ][ 'login' ],
    connectSettings[ 'proxy' ][ 'password' ],
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ]
  )
}
bot = telebot.TeleBot( connectSettings[ 'token' ] )
messages = getMessages()


def post( path, data ):
  return requests.post( 'http://{}/telegram/{}'.format(
    connectSettings[ 'databaseIp' ],
    path
  ), data ).json()

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
    printTest( message, response )
    msg = bot.send_message( message.chat.id, messages[ 'answerInfoShort' ] )
  elif response[ 'question' ][ 'type' ] == 'long':
    printTest( message, response )
    msg = bot.send_message( message.chat.id, messages[ 'answerInfoLong' ] )
  elif response[ 'question' ][ 'type' ] == 'variant':
    printTestVariant( message, response )
    msg = bot.send_message( message.chat.id, messages[ 'answerInfoTest' ] )
  
  bot.register_next_step_handler( msg, textAnswerHandler )


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
    msg = bot.send_message( message.chat.id, '{}, повторите попытку или напишите "Отмена"'.format(
      response[ 'error' ]
    ), reply_markup=keyboard )
    if response[ 'error' ] != 'Вы уже авторизованы в этой компании':
      bot.register_next_step_handler( msg, auth_ )
  else:
    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
    keyboard.row( '/info' )
    keyboard.row( '/help' )

    bot.send_message( message.chat.id, messages[ 'successAuth' ].format(
      response[ 'name' ]
    ), reply_markup=keyboard )


def printTest( message, test ):
  bot.send_message( message.chat.id, 'Вопрос:\n{}\n\n{}'.format(
    test[ 'question' ][ 'name' ],
    test[ 'question' ][ 'description' ]
  ) )


def printTestVariant( message, test ):
  answers = ''
  for i in range( len( test[ 'possibleAnswers' ] ) ):
    answers += '{}) {}\n\n'.format( i+1, test[ 'possibleAnswers' ][ i ][ 'description' ] )
  bot.send_message( message.chat.id, 'Вопрос:\n{}\n{}\n\n{}'.format(
    test[ 'question' ][ 'name' ],
    test[ 'question' ][ 'name' ],
    answers
  )  )


def getTestFromdb( message ):
  data = {
    'telegramId' : message.from_user.id
  }

  response = post( 'getQuestion', data )

  if not response[ 'isSuccess' ]:
    bot.send_message( message.chat.id, response[ 'error' ] )
    return False

  post( 'acceptQuestion', data )

  return response


def textAnswerHandler( message ):
  response = post( 'sendAnswer', {
    'telegramId' : message.from_user.id,
    'answer' : message.text
  } )

  if not response[ 'isSuccess' ]:
    bot.send_message( message.chat.id, response[ 'error' ] )
  else: 
    bot.send_message( message.chat.id, response[ 'message' ] )

  getTest( message )


@bot.message_handler( commands = [ 'info' ] )
def getInfoBlock( message ):
  keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  keyboard.row( '/startTest' )

  response = post( 'getInfoBlock', { 'telegramId' : message.from_id.id } )

  if not response[ 'isSuccess' ] :
    bot.send_message( message.chat.id, response[ 'error' ] )
  else: 
    bot.send_message( message.chat.id, 'Тема:{}\n\n{}\n\n{}'.format( 
      response[ 'infoBlock' ][ 'name' ],
      response[ 'infoBlock' ][ 'description' ],
      messages[ 'infoStartTest' ]
    ), reply_markup=keyboard )


@bot.message_handler( content_types = [ 'text' ] )
def default( message ):
  response = post( 'getStatus', { 'telegramId' : message.from_user.id } )

  if response[ 'isSuccess' ]: 
    if response[ 'status' ] == 3:
      textAnswerHandler( message )
      return False

  bot.send_message( message.from_user.id, 'Я Вас не понимаю(' )


print( 'Try to run bot with proxy {}:{}'.format(
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ] ) )
bot.polling()
