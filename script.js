let email = "";
async function carregarMensagens() {
    document.getElementById('messages').innerHTML = "";
    email = document.getElementById("email").value;

    if (email === null || email === '') {
        alert('Por favor, insira um e-mail.');
        return;
    }
    document.getElementById('welcome-message-left').innerHTML = "";
    document.getElementById("button-new-message").disabled = false;
    document.getElementById('msg-panel').innerHTML = "";
    

    fetch(`http://127.0.0.1:3000/messages?user=${email}`).then(async response => {
        const data = await response.json();

        data.selectedMessages.forEach(elemento => {
            if (elemento.remetente === email) {
                document.getElementById('messages').innerHTML += `
                    <div class="message-item" onclick=abrirMensagem('${elemento.id}') id="${elemento.id}">
                        <p class="header-preview">Enviada</p>
                        <div id="messageTitle"><h3>${elemento.assunto}</h3></div>
                        <p class="text-preview">${elemento.corpo}</p>
                    </div>
                `;
            } else {
                document.getElementById('messages').innerHTML += `
                    <div class="message-item" onclick=abrirMensagem('${elemento.id}') id="${elemento.id}">
                        <p class="header-preview">Recebida</p>
                        <h3>${elemento.assunto}</h3>
                        <p class="text-preview">${elemento.corpo}</p>
                    </div>
                `;
            }
        });
    }).catch(error => console.error('Error: ', error));
}

async function abrirMensagem(id) {
    document.getElementById('msg-panel').innerHTML = "";
    fetch(`http://127.0.0.1:3000/viewMessage?id=${id}`).then(async response => {
        const data = await response.json();
        if (email === data.remetente) {
            document.getElementById('msg-panel').innerHTML += `
                <div align="center">
                    <button onclick=openMessageEditorForward('${data.id}')>Encaminhar</button>
                    <button onclick=excluirMensagem('${data.id}')>Excluir</button> 
                </div>
            `;
        } else {
            document.getElementById('msg-panel').innerHTML += `
                <div align="center">
                    <button onclick=openMessageEditorAnswer('${data.id}')>Responder</button>
                    <button onclick=openMessageEditorForward('${data.id}')>Encaminhar</button>
                    <button onclick=excluirMensagem('${data.id}')>Excluir</button> 
                </div>
            `;
        }
        document.getElementById('msg-panel').innerHTML += `
            <p id="text-message">De: ${data.remetente}</p>
            <p id="text-message">Para: ${data.destinatario}</p><br>
            <h4>${data.assunto}</h4>
            <p id="text-message" class="message-body">${data.corpo}</p>
        `;
    }).catch(error => console.error('Error: ', error));
}

function openMessageEditor() {
    document.getElementById('msg-panel').innerHTML = "";
    document.getElementById('msg-panel').innerHTML = `
        <input value=${email} class="editor-input" disabled><br>
        <input id="receipt-mail" type="email" class="editor-input" placeholder="E-mail do destinatário" required><br>
        <input id="subject" class="editor-input" placeholder="Assunto" required><br>
        <textarea id="message-body" rows="10" cols="50" class="editor-input" placeholder="Sua mensagem aqui..." required></textarea><br>
        <button onClick=sendMessage()>Enviar</button>
    `;
}

async function sendMessage() {
    let receipt = document.getElementById("receipt-mail").value;
    let subject = document.getElementById("subject").value;
    let messageBody = document.getElementById("message-body").value;
    document.getElementById('msg-panel').innerHTML = "";
    fetch("http://127.0.0.1:3000/sendMessage?",
        {
            method: "POST",
            body: JSON.stringify({
                "remetente": email,
                "destinatario": receipt,
                "assunto": subject,
                "corpo": messageBody
            })
        }
    ).then(async response => {
        let data = await response.json();

        if(data.message === "Successful sent!") {
            carregarMensagens();
        }
    }).catch(error => console.error('Error:', error));
}

async function openMessageEditorAnswer(id) {
    fetch(`http://127.0.0.1:3000/viewMessage?id=${id}`).then(async response => {
        const data = await response.json();
        document.getElementById('msg-panel').innerHTML = "";
        document.getElementById('msg-panel').innerHTML = `
            <input value="${data.destinatario}" class="editor-input" disabled><br>
            <input value="${data.remetente}" id="receipt-mail" type="email" class="editor-input" disabled><br>
            <input value="${data.assunto}" id="subject" class="editor-input" disabled><br>
            <textarea id="message-body" rows="10" cols="50" class="editor-input" placeholder="Sua resposta aqui..." required></textarea><br>
            <button onClick=sendAnswer('${id}')>Enviar</button>
        `;
    }).catch(error => console.error('Error: ', error));
}

async function sendAnswer(id) {
    let messageBody = document.getElementById("message-body").value;
    document.getElementById('msg-panel').innerHTML = "";
    fetch("http://127.0.0.1:3000/answerMessage?",
        {
            method: "POST",
            body: JSON.stringify({
                "resposta": messageBody,
                "originalId": id
            })
        }
    ).then(async response => {
        let data = await response.json();

        if(data.message === "Successful answered!") {
            carregarMensagens();
        }
    }).catch(error => console.error('Error:', error));
}

async function openMessageEditorForward(id) {
    fetch(`http://127.0.0.1:3000/viewMessage?id=${id}`).then(async response => {
        const data = await response.json();
        document.getElementById('msg-panel').innerHTML = "";
        document.getElementById('msg-panel').innerHTML = `
            <input value="${email}" id="sender-mail" class="editor-input" disabled><br>
            <input id="receipt-mail" placeholder="E-mail do destinatário" type="email" class="editor-input" required><br>
            <input value="${data.assunto}" id="subject" class="editor-input" disabled><br>
            <textarea id="message-body" rows="5" cols="50" class="editor-input" placeholder="Seu comentário aqui..." required></textarea><br>
            <textarea id="original-message" rows="5" cols="50" class="editor-input" disabled>${data.corpo}</textarea><br>
            <button onClick=forwardMessage('${id}')>Enviar</button>
        `;
    }).catch(error => console.error('Error: ', error));
}

async function forwardMessage(id) {
    let sender = document.getElementById("sender-mail").value;
    let receipt = document.getElementById("receipt-mail").value;
    let messageBody = document.getElementById("message-body").value;
    document.getElementById('msg-panel').innerHTML = "";
    fetch("http://127.0.0.1:3000/forwardMessage?",
        {
            method: "POST",
            body: JSON.stringify({
                "remetente": sender,
                "destinatario": receipt,
                "mensagem": messageBody,
                "originalId": id
            })
        }
    ).then(async response => {
        let data = await response.json();

        if(data.message === "Successful forwarded!") {
            carregarMensagens();
        }
    }).catch(error => console.error('Error:', error));
}

async function excluirMensagem(id) {
    fetch(`http://127.0.0.1:3000/deleteMessage?id=${id}`,
        {
            method: "DELETE"
        }
    ).then(async response => {
        let data = await response.status;

        if(data === 204) {
            document.getElementById(id).style.display ="none"
        }
    }).catch(error => console.error('Error:', error));

    document.getElementById('msg-panel').innerHTML = "";
}