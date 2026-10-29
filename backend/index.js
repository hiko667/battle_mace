import { WebSocketServer } from 'ws';
import generateUniqueId from 'generate-unique-id';
import url from 'url'
import getPrimaryMission from './utils/getPrimary';

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
    let gameId
    switch (type) {
        case "new_game":
            gameId = createNewGame(uid)
            users[uid].currentGame = gameId
            console.log(`${users[uid].username} created game ${gameId}`)
            const response = JSON.stringify({
                "status" : "success",
                "gameId" : gameId,
            })
            break;
        case "join_game":
            gameId = message.game_id
            joinGame(uid, gameId)
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
    const newGameId = generateUniqueId({length: 7})
    games[newGameId] = {
        owner : uid,
        players : [uid],
        ready  : false,
        ongoing : false
    }
    return newGameId
}

const joinGame = (uid, gameId) => {
    const game = games[gameId]
    if(game.players.length > 1){
        throw new Error("This game is full")
    }
    game.players.push(uid)
    const message = JSON.stringify({
        "action" : "start_game",
        "starts" : games[gameId].players[Math.floor(Math.random()*games[gameId].players.length)]
    })
    game.ready = true
    broadCastToPlayers(gameId, message)
}

const start_game = (gameId) => {

}

const nextRound = (gameId) => {

}

const finishGame = (uid) => {

}

const broadCastToPlayers = (gameId, message) => {
    games[gameId].forEach(uid => 
        connections[uid].send(message)
    )
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
    if (!username){
        console.log("User tried to connect without some data")
        const response = JSON.stringify({ error : "Not enough data" })
        connection.send(response)
        connection.close()
    }
    else if(!detachment || !detachments.includes(detachment)){
        console.log(`User chose wrong or no detachment: ${detachment}`)
        const response = JSON.stringify({ error : "Detachment error" })
        connection.send(response)
        connection.close()
    }
    else if(!army){
        console.log(`User chose wrong or no army: ${detachment}`)
        const response = JSON.stringify({ error : "Army error" })
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