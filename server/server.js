import net from 'net'
import {PORT} from './config.js'


let sockets = [];

const server = net.createServer(socket => {

    sockets.push(socket);
        
    let cli=socket.remoteAddress;

    console.log("new client connected:",cli);
    
    socket.on('data', data => {
        broadcast(data, socket);
    });

    socket.on('error', err => {
        console.log('A client has disconnected.');
    });

    socket.on('close', () => {
        console.log("A client has left the chat.");
    });

});

server.listen(PORT,()=>{
    console.log("Servidor activo:", PORT)
});

const broadcast=(message, socketSent)=> {
    if (message === 'quit') {
        const index = sockets.indexOf(socketSent); //indentificacion directa con el socket, el servidor reconoce que socket son iguales al buscarlo.
        sockets.splice(index, 1);
    } else {
        sockets.forEach(socket => {
            if (socket !== socketSent) socket.write(message);
        });
    }
}