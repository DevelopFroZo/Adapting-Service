function sendTest(){
  console.log( saveClick() );
}

function index(){
  document.getElementById( "save-test" ).addEventListener( "click", sendTest );
}

window.addEventListener( "load", index );
