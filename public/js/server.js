let requests, cookie;

//===================== Workers ======================

async function getWorkers(){
  return await requests.post(
    "/workers/getAll"
  );
}

async function addWorker(name){
  return await requests.post(
    "./workers/create",
    {name}
  )
}

async function deleteWorker(workerId){
  return await requests.post(
    "./workers/delete",
    {workerId}
  )
}

async function unsubscribeWorker(workerId, infoBlockIds){
  return await requests.post(
    "./workers/unsubscribe",
    {workerId, infoBlockIds}
  )
}

async function subscribeWorker(workerId, infoBlockIds){
  return await requests.post(
    "./workers/subscribe",
    {workerId, infoBlockIds}
  )
}

async function getSubscriptions(workerId){
  return await requests.post(
    "./workers/getSubscriptions",
    {workerId}
  )
}

// ==================== Companies ====================
async function authorize(emailOrLogin, password) {
  let data;

  data = await requests.post(
    "/companies/authorize",
    { emailOrLogin, password }
  );

  if (!data.ok) return data;

  cookie.set("token", data.data);

  return { ok: true };
}

async function register(name, email, password, city, login) {
  let data;

  data = await requests.post(
    "/companies/register",
    { name, email, password, city, login }
  );

  if (!data.ok) {
    return data;
  }

  await authorize(email, password)

  return { ok: true };
}

async function editCompany(password, fields) {
  return await requests.post(
    "/companies/edit",
    { password, fields }
  );
}

async function getCompany() {
  return await requests.post(
    "/companies/getInfo"
  );
}

// ==================== Info blocks ====================
async function addInfoBlock(name, description) {
  return await requests.post(
    "/infoBlocks/add",
    { name, description }
  );
}

async function editInfoBlock(infoBlockId, fields) {
  return await requests.post(
    "/infoBlocks/edit",
    { infoBlockId, fields }
  );
}

async function getAllInfoBlocks() {
  return await requests.post(
    "/infoBlocks/getAll"
  );
}

async function deleteInfoBlock(infoBlockId) {
  return await requests.post(
    "/infoBlocks/delete",
    { infoBlockId }
  )
}

async function getFullInfoBlock(infoBlockId) {
  return await requests.post(
    "/tests/get",
    { infoBlockId }
  )
}

async function getSubscribers(infoBlockId){
  return await requests.post(
    "./infoBlocks/getSubscribers",
    {infoBlockId}
  )
}

async function subscribeTest(infoBlockId, workerIds){
  return await requests.post(
    "./infoBlocks/subscribe",
    {infoBlockId, workerIds}
  )
}

async function unsubscribeTest(infoBlockId, workerIds){
  return await requests.post(
    "./infoBlocks/unsubscribe",
    {infoBlockId, workerIds}
  )
}

// ==================== Questions ====================
async function addQuestion(infoBlockId, description, type, time) {
  return await requests.post(
    "/questions/add",
    { infoBlockId, description, type, time }
  );
}

async function editQuestion(questionId, fields) {
  return await requests.post(
    "/questions/edit",
    { questionId, fields }
  );
}

async function deleteQuestion(questionId) {
  return await requests.post(
    "/questions/delete",
    { questionId }
  )
}

// ==================== Possible answers ====================
async function addPossibleAnswer(questionId, description, isRight) {
  return await requests.post(
    "/possibleAnswers/add",
    { questionId, description, isRight }
  );
}

async function editPossibleAnswer(possibleAnswerId, fields) {
  return await requests.post(
    "/possibleAnswers/edit",
    { possibleAnswerId, fields }
  );
}

async function deletePossibleAnswer(possibleAnswerId) {
  return await requests.post(
    "/possibleAnswers/delete",
    { possibleAnswerId }
  )
}

function index() {
  requests = new Requests({
    dataType: "json",
    responsePreprocess: data => JSON.parse(data)
  });
  cookie = new Cookie();
}

index();
