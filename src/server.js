const http = require('http');

//const hostname = '127.0.0.1';
let port = process.env.PORT || 3000;

const server = require('./route.js'); // imports the routing file

server.listen(process.env.PORT || 3000 , () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
