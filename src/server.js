const http = require('http');

const port = 3000;

const server = require('./route.js'); // imports the routing file

server.listen(process.env.PORT || 3000 , () => {
    console.log(`Server running at port ${port}/`);
});
