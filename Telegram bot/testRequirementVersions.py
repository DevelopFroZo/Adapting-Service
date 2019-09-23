import gunicorn, requests, urllib3

def index():
  print( 'gunicorn version: {}'.format( gunicorn.__version__ ) )
  print( 'requests version: {}'.format( requests.__version__ ) )
  print( 'urllib3 version: {}'.format( urllib3.__version__ ) )

index()
