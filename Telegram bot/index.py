from connectSettings import getConnectSettings
import telebot

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

@bot.message_handler( commands = [ 'start' ] )
def start( message ):
  bot.send_message( message.chat.id, 'Hello' )

bot.polling()
