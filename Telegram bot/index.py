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


@bot.message_handler( commands = [ 'start' ] )
def start( message ):
  keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  keyboard.row( '/help' )
  
  bot.send_message( message.chat.id, messages[ 'greeting' ] )
  bot.send_message( message.chat.id, messages[ 'help' ] )
  bot.send_message( message.chat.id, messages[ 'info' ], reply_markup=keyboard )


@bot.message_handler( commands = [ 'help' ] )
def help( message ):
  bot.send_message( message.chat.id, messages[ 'help' ] )


@bot.message_handler( commands = ['auth'] )
def auth( message ):
  msg = bot.send_message( message.chat.id, messages[ 'auth' ] )
  bot.register_next_step_handler(msg, auth_ )


def auth_( message ):
  if message.text.lower() == 'отмена' :
    bot.send_message( message.chat.id, 'Авториация отменена' )
    return False

  msg = message.text.split( ',' )

  keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  keyboard.row( 'Отмена' )

  if len(msg) == 2:
    data = {
      'companyName' : msg[0],
      'key' : msg[1],
      'telegramId' : message.from_user.id
    }

    response = requests.post( 'http://{}/telegram/authorize'.format(
      connectSettings[ 'databaseIp' ]
    ), data ).json()
  else:
    msg = bot.send_message( message.chat.id, messages[ 'incorrectAuthData' ], reply_markup=keyboard )
    bot.register_next_step_handler( msg, auth_ )
    return

  if not response[ 'isSuccess' ] :
    msg = bot.send_message( message.chat.id, '{}, повторите попытку или напишите "Отмена"'.format(
      response[ 'error' ]
    ), reply_markup=keyboard )
    bot.register_next_step_handler( msg, auth_ )
  else:
    bot.send_message( message.chat.id, messages[ 'successAuth' ] )


@bot.message_handler( commands = [ 'test' ] )
def getTest( message ):

  response = getTestFromdb( message )

  # print( response )

  if not response[ 'isSuccess' ]:
    bot.send_message( message.chat.id, response[ 'error' ] )
  else:
    if response[ 'question' ][ 'type' ] == 'short':
      printTest( message, response )
      msg = bot.send_message( message.chat.id, messages[ 'answerInfoShort' ] )
      acceptQuestion( message )

      bot.register_next_step_handler( msg, textAnswerHandler )
    elif response[ 'question' ][ 'type' ] == 'long':
      printTest( message, response )
      msg = bot.send_message( message.chat.id, messages[ 'answerInfoLong' ] )
      acceptQuestion( message )

      bot.register_next_step_handler( msg, textAnswerHandler )
    elif response[ 'question' ][ 'type' ] == 'variant':
      printTestVariant( message, response )
      print( response[ 'possibleAnswers' ] )


def acceptQuestion( message ):
  data = {
    'telegramId' : message.from_user.id
  }

  requests.post( 'http://{}/telegram/acceptQuestion'.format(
    connectSettings[ 'databaseIp' ]
  ), data )


def printTest( message, test ):
  bot.send_message( message.chat.id, 'Вопрос:\n{}'.format(
    test[ 'question' ][ 'name' ]
  ) )
  bot.send_message( message.chat.id, '{}'.format(
    test[ 'question' ][ 'description' ]
  ) )


def printTestVariant( message, test ):
  bot.send_message( message.chat.id, 'Вопрос:\n{}'.format(
    test[ 'question' ][ 'name' ]
  )  )
  bot.send_message( message.chat.id, '{}'.format(
    test[ 'question' ][ 'description' ]
  ) )


def getTestFromdb( message ):
  data = {
    'telegramId' : message.from_user.id
  }

  return requests.post( 'http://{}/telegram/getQuestion'.format(
    connectSettings[ 'databaseIp' ]
  ), data ).json()


def textAnswerHandler( message ):
  print( message.text )
  data = {
    'telegramId' : message.from_user.id,
    'answer' : message.text
  }

  response = requests.post( 'http://{}/telegram/sendAnswer'.format(
    connectSettings[ 'databaseIp' ]
  ), data ).json()

  if not response[ 'isSuccess' ]:
    bot.send_message( message.chat.id, response[ 'error' ] )
  else: 
    bot.send_message( message.chat.id, response[ 'message' ] )

  # keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
  # keyboard.row( 'Ответ 1', 'Ответ 2' )
  # keyboard.row( 'Ответ 3', 'Ответ 4' )

  # bot.send_message( message.chat.id, 'Вопрос', reply_markup=keyboard )


@bot.message_handler( commands = [ 'info' ] )
def getInfoBlock( message ):
  data = {
    'telegramId' : message.from_user.id
  }

  response = requests.post( 'http://{}/telegram/getInfoBlock'.format(
    connectSettings[ 'databaseIp' ]
  ), data ).json()

  if not response[ 'isSuccess' ] :
    bot.send_message( message.chat.id, response[ 'error' ] )
  else: 
    bot.send_message( message.chat.id, 'Тема:\n{}'.format( response['name'] ) )
    bot.send_message( message.chat.id, response[ 'description' ] )


@bot.message_handler( content_types = [ 'text' ] )
def default( message ):
  # data = {
  #   'telegramId' : message.from_user.id
  # }

  # response = requests.post( 'http://{}/telegram/getStatus'.format(
  #   connectSettings[ 'databaseIp' ]
  # ), data ).json()

  # print( response )

  bot.send_message( message.chat.id, 'Я Вас не понимаю(' )


print( 'Try to run bot with proxy {}:{}'.format(
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ] ) )
bot.polling()
