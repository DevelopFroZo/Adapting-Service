let requests, cookie;

async function addInfoBlock( name, description, number ){
  return await requests.post(
    "/infoBlocks/add",
    { name, description, number }
  );
}

function index(){
  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();

  console.log( addInfoBlock( "Name", "Description", 1 ) );
}

index();
