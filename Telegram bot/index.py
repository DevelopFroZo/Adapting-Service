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

  msg = message.text.split( ' ' )

  data = {
    'companyName' : msg[0],
    'key' : msg[1],
    'telegramId' : message.from_user.id
  }

  response = requests.post( 'http://{}/telegram/authorize'.format(
    connectSettings[ 'databaseIp' ]
  ), data ).json()

  if not response[ 'isSuccess' ] :
    keyboard = telebot.types.ReplyKeyboardMarkup( resize_keyboard=True, one_time_keyboard=True )
    keyboard.row( 'Отмена' )

    msg = bot.send_message( message.chat.id, '{}, повторите попытку или напишите "Отмена"'.format(
      response[ 'error' ]
    ), reply_markup=keyboard )
    bot.register_next_step_handler( msg, auth_ )
  else:
    bot.send_message( message.chat.id, 'Поздравляю, Вы успешно авторизованы!' )


@bot.message_handler( commands = [ 'test' ] )
def getTest( message ):
  data = {
    'telegramId' : message.from_user.id
  }

  response = requests.post( 'http://{}/telegram/getQuestion'.format(
    connectSettings[ 'databaseIp' ]
  ), data ).json()

  print( response )

  if not response[ 'isSuccess' ]:
    bot.send_message( message.chat.id, response[ 'error' ] )
  else:
    if response[ 'question' ][ 'type' ] == 'short':
      bot.send_message( message.chat.id, 'Вопрос:\n{}'.format(
        response[ 'question' ][ 'name' ]
      ) )
      bot.send_message( message.chat.id, '{}'.format(
        response[ 'question' ][ 'description' ]
        ) )
      msg = bot.send_message( message.chat.id, 'Ожидаю ответ\nВведите ответ одним словом' )

      acceptQuestion( message )

      bot.register_next_step_handler( msg, textAnswerHandler )
    elif response[ 'question' ][ 'type' ] == 'long':
      bot.send_message( message.chat.id, 'Вопрос:\n{}'.format(
        response[ 'question' ][ 'name' ]
      ) )
      bot.send_message( message.chat.id, '{}'.format(
        response[ 'question' ][ 'description' ]
      ) )
      msg = bot.send_message( message.chat.id, 'Ожидаю ответ\nОтвет может быть произвольным и будет проверяться работодателем' )

      acceptQuestion( message )

      bot.register_next_step_handler( msg, textAnswerHandler )

def acceptQuestion( message ):
  data = {
    'telegramId' : message.from_user.id
  }

  requests.post( 'http://{}/telegram/acceptQuestion'.format(
    connectSettings[ 'databaseIp' ]
  ), data )

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
  bot.send_message( message.chat.id, 'Я Вас не понимаю(' )


print( 'Try to run bot with proxy {}:{}'.format(
    connectSettings[ 'proxy' ][ 'ip' ],
    connectSettings[ 'proxy' ][ 'port' ] ) )
bot.polling()
