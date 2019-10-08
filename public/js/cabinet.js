$(document).ready(async function(){
    await authorize("example@example.com", "123456");

    let blocksInfo = await getAllInfoBlocks();
    console.log(blocksInfo)

})