function type( el, isFull ){
  isFull = isFull === true;

  if( el === undefined )
    return isFull ? `${el}` : `${el}`[0];

  if( el === null )
    return isFull ? `${el}` : `${el}`.slice( 0, 2 );

  let h;

  h = typeof( el );

  if( isNaN( el ) && h === "number" )
    return isFull ? "nan" : "na";

  if( h === "string" || h === "boolean" || h === "function" )
    return isFull ? h : h[0];

  if( h === "number" ){
    if( el.toString().indexOf( "." ) === -1 )
      return isFull ? "int" : "i";

    return isFull ? "float" : "f";
  }

  if( type( el.length ) === "i" )
    return isFull ? "array" : "a";

  return isFull ? "object" : "o";
}

function isUndefined( el ){
  return type( el ) === "u" ? true : false;
}

function isNull( el ){
  return type( el ) === "nu" ? true : false;
}

function isNaN_( el ){
  return type( el ) === "na" ? true : false;
}

function isString( el ){
  return type( el ) === "s" ? true : false;
}

function isBoolean( el ){
  return type( el ) === "b" ? true : false;
}

function isFunction( el ){
  return type( el ) === "f" ? true : false;
}

function isInt( el ){
  return type( el ) === "i" ? true : false;
}

function isFloat( el ){
  return type( el ) === "f" ? true : false;
}

function isArray( el ){
  return type( el ) === "a" ? true : false;
}

function isObject( el ){
  return type( el ) === "o" ? true : false;
}
