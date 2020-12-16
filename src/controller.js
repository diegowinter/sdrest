const url = require('url');
const messages = require('./userData.json');
const mysql = require('mysql');
const fs = require('fs');
const { nanoid } = require('nanoid');

const availableEndpoints = [
    {
        method: "GET",
        getUsers: "/users"
    },
    {
        method: "POST",
        createUser: "/user"
    }
]

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

        fs.writeFileSync('./src/userData.json', JSON.stringify(messages), 'utf8', (err) => {
            if(err) {
                console.log(err);
            }
        });

        res.statusCode = 201;
        res.setHeader('content-Type', 'Application/json');
        res.end(JSON.stringify({"message": "Successful sent!"}));
    })
}

exports.deleteMessage = function(req, res) {
    const reqUrl = url.parse(req.url, true);
    let updatedMessages = messages.messages.filter(message => message.id !== reqUrl.query.id);
    updatedMessages = {"messages": updatedMessages};

    fs.writeFileSync('./src/userData.json', JSON.stringify(updatedMessages), 'utf8', (err) => {
        if(err) {
            console.log(err);
        }
    });

    res.statusCode = 200;
    res.setHeader('content-Type', 'Application/json');
    res.end(JSON.stringify({"message": "Successfully deleted!"}));
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
            assunto: originalMessage.assunto,
            corpo: newMessage
        }
        let updatedMessages = messages.messages.push(newBody);
        fs.writeFileSync('./src/userData.json', JSON.stringify(messages), 'utf8', (err) => {
            if(err) {
                console.log(err);
            }
        });

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
        fs.writeFileSync('./src/userData.json', JSON.stringify(messages), 'utf8', (err) => {
            if(err) {
                console.log(err);
            }
        });

        res.statusCode = 201;
        res.setHeader('content-Type', 'Application/json');
        res.end(JSON.stringify({"message": "Successful answered!"}));
    });
}

exports.invalidUrl = function(req, res) {
    var response = [
        {
            "message": "oops! that is a wrong endpoint, here are the available endpoints "
        },
        availableEndpoints
    ]
    res.statusCode = 404;
    res.setHeader('content-Type', 'Application/json');
    res.end(JSON.stringify(response));
}