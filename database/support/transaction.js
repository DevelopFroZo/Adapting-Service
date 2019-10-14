class Transaction{
  constructor( client, path ){
    this.client = client;
    this.path = path;
    this.state = 0;
    this.count = 1;
  }

  async open(){
    if( this.state > 0 ) return;

    this.client = await this.client.connect();
    await this.client.query( "begin" );
    this.state = 1;
  }

  async end( mode ){
    if( this.state === 0 || this.state === 2 ) return;

    if( mode === false ) await this.client.query( "rollback" );
    else await this.client.query( "commit" );

    await this.client.release();
    this.state = 2;
  }

  async query( sql, data ){
    try{
      if( this.state === 2 ) throw "Client released";

      let queryData;

      await this.open();
      queryData = await this.client.query( sql, data );
      this.count++;

      return queryData;
    }
    catch( error ){
      if( this.state < 2 ){
        console.log( `[${this.path}] where query number ${this.count}` );
        console.log( `  ${error}` );

        await this.end( false );
      }

      throw `[${this.path}] Problems with database`;
    }
  }
}

module.exports = Transaction;
