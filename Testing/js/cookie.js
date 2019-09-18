class Cookie{
  constructor( isNotLoad ){
    if( isNotLoad !== true ) this.load();
  }

  load(){
    let tmp0, tmp1;

    this.data = {};
    tmp0 = document.cookie.split( "; " );
    tmp0.forEach( el => {
      tmp1 = el.split( "=" );
      this.data[ tmp1[0] ] = tmp1[1];
    } );
  }

  set( key, value ){
    document.cookie = `${key}=${value}`;
    this.data[ key ] = value;
  }

  get( key ){
    return this.data[ key ] ? this.data[ key ] : false;
  }

  delete( key ){
    document.cookie = `${key}=; max-age=0`;
  }
}
