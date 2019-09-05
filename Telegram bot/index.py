import telebot
from telebot import apihelper

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
def test( message ):
  bot.send_message( message.chat.id, 'hello' )

print( 'Try to run bot with proxy {}'.format( proxyUrl ) )
bot.polling()
