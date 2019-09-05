import telebot

f = open( 'token.txt', 'r' )
token = f.readline()[ : -1 ]
f.close()

bot = telebot.TeleBot( token )

bot.polling()
