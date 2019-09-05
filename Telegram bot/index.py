import telebot
from telebot import apihelper
from random import randint

f = open( 'token.txt', 'r' )
token = f.readline()[ : -1 ]
f.close()

# 157.230.241.65:1080       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!

proxyUrl = '157.230.241.65:1080'
telebot.apihelper.proxy = {
  'https' : 'socks5h://{}'.format( proxyUrl )
}
bot = telebot.TeleBot( token )

@bot.message_handler( commands = [ 'start' ] )
def start( message ):
  bot.send_message( message.chat.id, 'Hello, this bot can do nothing. Type /help' )

@bot.message_handler( commands = [ 'help' ] )
def help( message ):
  bot.send_message( message.chat.id, 'Yeah. For calculate two numbers type\ncalc %num% %num% %sign%\nWhere sign is: +, -, /, *' )

@bot.message_handler( content_types = [ 'text' ] )
def calc( message ):
  print( '{}: {}'.format( message.from_user.username, message.text ) )

  tmp = str( message.text ).split( ' ' )
  cmd = tmp[0]

  if cmd.lower() != 'calc':
    bot.send_message( message.chat.id, 'ну ты мда' )

    return

  num0 = int( tmp[1] )
  num1 = int( tmp[2] )
  res = num0 + num1
  bot.send_message( message.chat.id, '{}'.format( res ) )

print( 'Try to run bot with proxy {}'.format( proxyUrl ) )
bot.polling()
