var client
var botId

function connectBot(discord, token) {
    client = new discord.Client()
    client.login(token)
        .catch(function (error) {
            console.log("error")
            client.emit("botLogin", { "success": false })
        })
    client.once("ready", function () {
        console.log("client "+client)
        botId = client.user.id
        client.emit("botLogin", { "success": true})
    })
    client.once("error", function (error) {
        client.emit("botLogin", { "success": false })
    })

    return new Promise((resolve, reject) => {
        client.once("botLogin", function (data) {
            resolve(data)
        })
    })
}

function cleanData(botData,cleanArray){
    var dataArray = []
    botData.each(function(channel){
      var data = {}
      for (var i in cleanArray){
          if (cleanArray[i].childToKeep && cleanArray[i].childToKeep.length>=1 && channel[cleanArray[i].data]){
            data[cleanArray[i].data] = {}
            for (var a in cleanArray[i].childToKeep){
                data[cleanArray[i].data][cleanArray[i].childToKeep[a]] = channel[cleanArray[i].data][cleanArray[i].childToKeep[a]]
            }
          }else{
            data[cleanArray[i].data] = channel[cleanArray[i].data]
          }
      }
      dataArray.push(data)
    })
    return dataArray
}
module.exports = {
    async getBotGuilds(discord, token, id) {
        var dataToKeep = [{"data":"id","childToKeep":[]},{"data":"name","childToKeep":[]}]
        if (!client || !client.user || client.user.id != id) {
            var connectBotData = await connectBot(discord, token)
            if (connectBotData.success == false) {
                return { "success": false, "error": "Bot can not connect" }
            }
        }
        var finalData = cleanData(client.guilds.cache,dataToKeep)
        return { "success": true, "data": finalData }
    },
    async getGuildChannels(discord,token,id,guildId){
        console.log("getGuildChannels")
        var dataToKeep = [{"data":"id","childToKeep":[]},{"data":"name","childToKeep":[]},{"data":"parent","childToKeep":["id","name"]},{"data":"type","childToKeep":[]}]
        if (!client || !client.user || client.user.id!=id){
            var connectBotData = await connectBot(discord,token)
            if (connectBotData.success == false){
                return {"success":false,"error":"Bot can not connect"}
            }
        }
        var finalData = cleanData(client.guilds.cache.get(guildId).channels.cache,dataToKeep)
        
    return {"success":true,"data":finalData,guildId:guildId}
    }
}