
import {networkInterfaces} from 'os'

const PORT=3000;
let host;

if(networkInterfaces()['Wi-Fi'])
networkInterfaces()['Wi-Fi'].map((network)=>{
    if(network.family==='IPv4'){host=network.address;}
})

if(host==undefined) host='127.0.0.1'

export {PORT,host}