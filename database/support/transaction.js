class Transaction{
  constructor( client, path ){
    this.path = path;
    this.client = client;
    this.isOpened = false;
    this.count = 1;
  }

  async open(){
    if( this.isOpened ) return;

    await this.client.query( "begin" );
    this.isOpened = true;
  }

  async query( sql, data ){
    let queryData;

    try{
      this.open();
      queryData = await this.client.query( sql, data );
      this.count++;

      return queryData;
    }
    catch( error ){
      console.log( `  [${this.path}] where query number ${this.count}` );
      console.log( error );

      await this.client.query( "rollback" );
      await this.client.release();
      this.isOpened = false;

      throw `[${this.path}] Problems with database`;
    }
  }

  async end( mode ){
    if( this.isOpened ){
      if( mode === false ) await this.client.query( "rollback" );
      else await this.client.query( "commit" );

      this.isOpened = false;
    }

    await this.client.release();
    this.count = 1;
  }
}

module.exports = Transaction;
