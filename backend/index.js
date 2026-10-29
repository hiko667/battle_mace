import { WebSocketServer } from 'ws';
import generateUniqueId from 'generate-unique-id';
import url from 'url'

const wsServer = new WebSocketServer({ port: 8080 });
const detachments = ['take_and_hold', 'disruption', 'purge_the_foe', 'priority_assets', 'reconnaissance']

console.log("◇─◇──◇──System Logs──◇──◇─◇")

const connections = {}
const users = {}
const games = {}


const handleMessage = (uid, bytes) => {
    try{
    const connection = connections[uid]
    const message = JSON.parse(bytes.toString())
    const type = message.type
    console.log(`Action from ${users[uid].username} Type : ${type}`)
    console.log(type)
    switch (type) {
        case "newGame":
            const gameId = createNewGame(uid)
            users[uid].currentGame = gameId
            console.log(`${users[uid].username} created game ${gameId}`)
            const response = JSON.stringify({
                "status" : "success",
                "gameId" : gameId
            })
            break;

        default:
            throw new Error("No such option")
            break;
    }
    }
    catch (error){
        console.log(`User ${users[uid].username} caused error - ${error.toString()}`)
        const response = JSON.stringify({ "error": error.toString() })
        connections[uid].send(response)
    }
}

const createNewGame = (uid) => {
    const host = users[uid]
    if(host.currentGame !== null){
        const oldGameId = host.currentGame
        const oldGame = games[oldGameId]
        console.log(`Removing ${users[uid].username} from game ${oldGameId}`)
        oldGame.players.filter(item => item !== uid)

    }
    const newGameId = generateUniqueId()
    games[newGameId] = {
        owner : uid,
        players : [uid],
    }
    return newGameId
}

const joinGame = (uid, gameId) => {

}

const nextRound = (gameId) => {

}

const finishGame = (uid) => {

}

const broadCastToPlayers = (gameId) => {

}

const handleDisconenction = (uid) => {
    console.log(`User ${users[uid].username} has disconected`)
    delete connections[uid]
    delete users[uid]
}


const broadCast = (message) => {
    Object.keys(connections).forEach(uid =>
        connections[uid].send(message)
    )
}

wsServer.on('connection', (connection, request) => {
    const {username, detachment, army} = url.parse(request.url, true).query
    if (!username || !detachment || !army){
        console.log("User tried to connect without some data")
        const response = JSON.stringify({ error : "Not enough data" })
        connection.send(response)
        connection.close()
    }
    else if(!detachments.includes(detachment)){
        console.log(`User chose wrong detachment: ${detachment}`)
        const response = JSON.stringify({ error : "Detachment off the list" })
        connection.send(response)
        connection.close()
    }
    else{
        console.log(`User ${username} connected`)
        const uid = generateUniqueId()
        connections[uid] = connection

        users[uid] = {
            username: username,
            id : uid,
            currentGame : null,
            detachment : detachment,
            army : army
        }

        connection.on("message", message => handleMessage(uid, message))
        connection.on("close", () => handleDisconenction(uid))
    }
})