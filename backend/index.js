import { WebSocketServer } from 'ws';
import generateUniqueId from 'generate-unique-id';
import url from 'url'

const wsServer = new WebSocketServer({ port: 8080 });

console.log("◇─◇──◇──System Logs──◇──◇─◇")

connections = {}
users = {}
games = {}
userGames = {}


const handleMessage = (uid, message) => {

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
            id : uid
        }

        sendAllDevices(uid)
        connection.on("message", message => handleMessage(uid, message))
        connection.on("close", () => handleDisconenction(uid))
    }
})