const http = require('http');
const url = require('url');

module.exports = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE');
	res.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}

    var userOps = require('./controller.js'); // importing the main logic
    const reqUrl =  url.parse(req.url, true);
    const params = JSON.parse(JSON.stringify(reqUrl.query));

    // Rota para listagem de mensagens (GET endpoint)
    if(reqUrl.pathname == '/messages' && req.method === 'GET' && params.user !== undefined) {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.getMessages(req, res);
    }

    // Rota para envio de mensagens (POST endpoint)
    else if(reqUrl.pathname == '/sendMessage' && req.method === 'POST') {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.sendMessage(req, res);
    }

    // Rota para apagar mensagens (DELETE endpoint)
    else if(reqUrl.pathname == '/deleteMessage' && req.method === 'DELETE' && params.id !== undefined) {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.deleteMessage(req, res);
    }

    // Rota para abrir mensagem (GET endpoint)
    else if(reqUrl.pathname == '/viewMessage' && req.method === 'GET' && params.id !== undefined) {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.viewMessage(req, res);
    }

    // Rota para encaminhar mensagem (POST endpoint)
    else if(reqUrl.pathname == '/forwardMessage' && req.method === 'POST') {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.forwardMessage(req, res);
    }

    //Rota para responder mensagem (POST endpoint)
    else if(reqUrl.pathname == '/answerMessage' && req.method === 'POST') {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.answerMessage(req, res);
    }

    // invalid URL
    else {
        console.log('Request type: ' + req.method + ' Endpoint: ' + req.url);
        userOps.invalidUrl(req, res);
    }
    
})