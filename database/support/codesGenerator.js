class CodesGenerator{
  constructor( state ){
    state = state.split( "," );

    for( let i = 0; i < state.length; i++ )
      state[i] = parseInt( state[i] );

    this.state = state;
  }

  updateState(){
    for( let i = this.state.length - 1; i > -1; i-- )
      if( this.state[i] < 61 ){
        this.state[i]++;
        break;
      } else this.state[i] = 0;
  }

  next(){
    let code;

    code = "";

    this.state.map( el => {
      if( el < 10 ) code += el;
      else if( el < 36 ) code += String.fromCharCode( 87 + el );
      else code += String.fromCharCode( 29 + el );
    } );

    this.updateState();

    return code;
  }
}

module.exports = CodesGenerator;
