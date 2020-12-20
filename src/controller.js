const url = require('url');
const messages = require('./userData.json');
const mysql = require('mysql');
const fs = require('fs');
const { nanoid } = require('nanoid');

exports.getMessages = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    
    const selectedMessages = messages.messages.filter(message => {
        return message.remetente == reqUrl.query.user ||
            message.destinatario == reqUrl.query.user;
    });

    var response = {
        "selectedMessages": selectedMessages
    };
    res.statusCode = 200;
    res.setHeader('content-Type', 'Application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify(response));
}

exports.sendMessage = function(req, res) {
    let body = '';

    req.on('data',  function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        let jsonBody = JSON.parse(body);
        let newBody = {id: nanoid(5), time: Date.now(), ...jsonBody};
        let updatedMessages = messages.messages.push(newBody);
        messages.messages.sort((a, b) => b.time - a.time);
        
        writeFile(messages);

        res.statusCode = 201;
        res.setHeader('content-Type', 'Application/json');
        res.end(JSON.stringify({"message": "Successful sent!"}));
    })
}

exports.deleteMessage = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    let updatedMessages = messages.messages.filter(message => message.id !== reqUrl.query.id);
    let messagesToWrite = {"messages": updatedMessages};
    messagesToWrite.messages.sort((a, b) => b.time - a.time);
    console.log(messagesToWrite);

    writeFile(updatedMessages);

    res.statusCode = 204;
    res.end();
}

exports.viewMessage = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    let message = messages.messages.find(message => message.id === reqUrl.query.id);
    var response = message;
    res.statusCode = 200;
    res.setHeader('content-Type', 'Application/json');
    res.end(JSON.stringify(response))
}

exports.forwardMessage = function(req, res) {
    let body = '';

    req.on('data',  function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        let jsonBody = JSON.parse(body);
        let originalMessage = messages.messages.find(message => message.id === jsonBody.originalId);
        let newMessage = jsonBody.mensagem + "\n" + originalMessage.corpo;
        let newBody = {
            id: nanoid(5),
            time: Date.now(),
            remetente: jsonBody.remetente,
            destinatario: jsonBody.destinatario,
            assunto: "ENC: " + originalMessage.assunto,
            corpo: newMessage
        }
        let updatedMessages = messages.messages.push(newBody);
        messages.messages.sort((a, b) => b.time - a.time);
        
        writeFile(messages);

        res.statusCode = 201;
        res.setHeader('content-Type', 'Application/json');
        res.end(JSON.stringify({"message": "Successful forwarded!"}));
    });
}

exports.answerMessage = function(req, res) {
    let body = '';

    req.on('data',  function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        let jsonBody = JSON.parse(body);
        let originalMessage = messages.messages.find(message => message.id === jsonBody.originalId);
        let newMessage = jsonBody.resposta +
            "\n ------------------ \n" +
            originalMessage.corpo;
        let newBody = {
            id: nanoid(5),
            time: Date.now(),
            remetente: originalMessage.destinatario,
            destinatario: originalMessage.remetente,
            assunto: "RE: " + originalMessage.assunto,
            corpo: newMessage
        }
        let updatedMessages = messages.messages.push(newBody);
        messages.messages.sort((a, b) => b.time - a.time);
        
        writeFile(messages);

        res.statusCode = 201;
        res.setHeader('content-Type', 'Application/json');
        res.end(JSON.stringify({"message": "Successful answered!"}));
    });
}

exports.invalidUrl = function(req, res) {
    var response = [
        {
            "message": "Not found."
        }
    ]
    
    res.statusCode = 404;
    res.setHeader('content-Type', 'Application/json');
    res.end(JSON.stringify(response));
}

function writeFile(data) {
    fs.writeFileSync('./src/userData.json', JSON.stringify(data), 'utf8', (err) => {
        if(err) {
            console.log(err);
        }
    });
}
