import psycopg2
from connectSettings import getConnectSettings

settings = getConnectSettings()

try:
    conn = psycopg2.connect( "dbname='{}' user='{}' host='{}:{}' password='{}'".format(
        settings[ 'database' ],
        settings[ 'user' ],
        settings[ 'host' ],
        settings[ 'port' ],
        settings[ 'password' ],
    ) )
except:
    print( "I am unable to connect to the database" )

cur = conn.cursor()