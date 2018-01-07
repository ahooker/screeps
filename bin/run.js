var config = require('./config');

const { ScreepsAPI } = require('screeps-api');
const fs = require('fs');

// All options are optional
const api = new ScreepsAPI({
  token: config.token,
  protocol: 'https',
  hostname: 'screeps.com',
  port: 443,
  path: '/' // Do no include '/api', it will be added automatically
});

api.memory.get()
  .then(memory => {
    fs.writeFileSync('memory.json', JSON.stringify(memory))
  })
  .catch(err => console.error(err));

api.me().then((user)=>console.log(user))

api.socket.connect()
api.socket.subscribe('cpu',(event)=>console.log('cpu',event.data))
api.socket.subscribe('console', (event)=>{
    if (event.data.messages.log) {
        event.data.messages.log.forEach((line)=>{
            console.log(line);
        })
    } else {
        console.dir('Hmm', event.data.messages);
    }
    // console.log(event.data.messages.log) // List of console.log output for tick
})

