$(document).ready(async function(){
    await authorize("example@example.com", "123456");

    initTests()

})

async function initTests(){
    let testBlock = $("#hidden-test-block");
    $("#hidden-test-block").remove();
    testBlock.removeAttr("id");

    let blocksInfo = await getAllInfoBlocks();

    if(blocksInfo.isSuccess){
        for(let i = 0; i < blocksInfo.infoBlocks.length; i++){

            let block = $("<div/>").addClass("test-block").html(testBlock.html());
            let description;
            block.find(".test-name").text(blocksInfo.infoBlocks[i].name);
            if(blocksInfo.infoBlocks[i].description.length > 72)
                description = (blocksInfo.infoBlocks[i].description).substring(0, 73) + "...";
            else
                description = blocksInfo.infoBlocks[i].description;
            block.children(".test-description").text(description);

            block.find(".edit-test").attr("href", "./index.html?id=" + blocksInfo.infoBlocks[i].id);

            block.find(".delete-test").on("click", async function(){
                let deleteStatus = await deleteInfoBlock(blocksInfo.infoBlocks[i].id);

                if(deleteStatus.isSuccess){
                    block.remove();
                }
                else{
                    console.log("Ошибка при удалении " + blocksInfo.infoBlocks[i].id + " блока")
                }
            })

            $("#new-test").after(block);
        }
        
        if($(".test-block").length % 3 === 1)
            $("#help-test-block").show();
    }
}