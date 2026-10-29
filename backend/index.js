import { WebSocketServer } from 'ws';
import generateUniqueId from 'generate-unique-id';
import url from 'url'

const wsServer = new WebSocketServer({ port: 8080 });

console.log("◇─◇──◇──System Logs──◇──◇─◇")

const connections = {}
const users = {}
const games = {}


const handleMessage = (uid, bytes) => {
    try{
    const connection = connections[uid]
    const message = JSON.parse(bytes.toString())
    const type = message.type
    console.log(message)
    console.log(`Action from ${users[uid].username} Type : ${type}`)
    console.log(type)
    switch (type) {
        case "newGame":
            const uid = generateUniqueId()
            console.log(`New game at id ${uid}`)
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
    const {username} = url.parse(request.url, true).query
    if (!username){
        console.log("User tried to connect without username")
        const response = JSON.stringify({ error : "Not enough data" })
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
            currentGame : null
        }

        connection.on("message", message => handleMessage(uid, message))
        connection.on("close", () => handleDisconenction(uid))
    }
})