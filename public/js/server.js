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

async function addInfoBlock( name, description, number ){
  return await requests.post(
    "/infoBlocks/add",
    { name, description, number }
  );
}

async function addQuestion( infoBlockId, description, type, time, number ){
  return await requests.post(
    "/questions/add",
    { infoBlockId, name : "", description, type, time, number }
  );
}

async function addPossibleAnswer( questionId, description, isRight, number ){
  return await requests.post(
    "/possibleAnswers/add",
    { questionId, description, isRight, number }
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
