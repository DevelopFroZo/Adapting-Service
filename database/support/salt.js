function salt( length ){
  let salt;

  salt = "";

  for( let i = 0; i < length; i++ )
    if( ( Math.random() + 0.1 ) <= 0.5 ) salt += Math.floor( Math.random() * 10 );
    else salt += String.fromCharCode( 97 + Math.floor( Math.random() * 26 ) );

  return salt;
}

module.exports = salt;
