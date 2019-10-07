let requests, cookie;

// ==================== Companies ====================
async function authorize( emailOrLogin, password ){
  let data;

  data = await requests.post(
    "/companies/authorize",
    { emailOrLogin, password }
  );

  if( !data.isSuccess ) return data;

  cookie.set( "token", data.token );

  return { isSuccess : true };
}

async function editCompany( password, fields ){
  return await requests.post(
    "/companies/edit",
    { password, fields }
  );
}

// ==================== Info blocks ====================
async function addInfoBlock( name, description){
  return await requests.post(
    "/infoBlocks/add",
    { name, description}
  );
}

async function editInfoBlock( infoBlockId, fields ){
  return await requests.post(
    "/infoBlocks/edit",
    { infoBlockId, fields }
  );
}

async function getAllInfoBlocks(){
  return await requests.post(
    "/infoBlocks/getAll"
  );
}

// ==================== Questions ====================
async function addQuestion( infoBlockId, description, type, time){
  return await requests.post(
    "/questions/add",
    { infoBlockId, name : "", description, type, time}
  );
}

async function editQuestion( questionId, fields ){
  return await requests.post(
    "/questions/edit",
    { questionId, fields }
  );
}

// ==================== Possible answers ====================
async function addPossibleAnswer( questionId, description, isRight){
  return await requests.post(
    "/possibleAnswers/add",
    { questionId, description, isRight}
  );
}

async function editPossibleAnswer( possibleAnswerId, fields ){
  return await requests.post(
    "/possibleAnswers/edit",
    { possibleAnswerId, fields }
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
