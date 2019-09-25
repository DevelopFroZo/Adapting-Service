let requests, cookie;

async function authorize( email, password ){
  let data;

  data = await requests.post(
    "/companies/authorize",
    { email, password }
  );

  if( !data.isSuccess ) return data;

  cookie.set( "token", data.token );

  return { isSuccess : true };
}

async function addInfoBlock( name, description){
  return await requests.post(
    "/infoBlocks/add",
    { name, description}
  );
}

async function addQuestion( infoBlockId, description, type, time){
  return await requests.post(
    "/questions/add",
    { infoBlockId, name : "", description, type, time}
  );
}

async function addPossibleAnswer( questionId, description, isRight){
  return await requests.post(
    "/possibleAnswers/add",
    { questionId, description, isRight}
  );
}

function index(){
  requests = new Requests( {
    dataType : "json",
    responsePreprocess : data => JSON.parse( data )
  } );
  cookie = new Cookie();
  cookie.delete( "token" );
}

index();
