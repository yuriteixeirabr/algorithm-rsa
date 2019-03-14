'use strict';
const fs = require('fs');
const nodeRsa = require('node-rsa');

const writeKeys = key => {
    const keyThing = key.exportKey('components');
    const exportedPublic = key.exportKey('pkcs1-public');
    const exportedPrivate = key.exportKey('pkcs1-private');
    console.log(
        '\n\nGenerated Public=\n\n' +
        exportedPublic +
        '\n\n [testNodeRsa.js.moduleFunction]'
    );
    console.log(
        '\n\nGenerated Private=\n\n' +
        exportedPrivate +
        '\n\n [testNodeRsa.js.moduleFunction]'
    );
};

const runRsaDemo = (testName, text, privateKeyInbound, publicKeyInbound) => {
    if (!publicKeyInbound.match(/^-----BEGIN RSA PUBLIC KEY-----/)) {
        console.log(
            'chave pública não se encontra no formato pem, use o comando para converter sua chave para pem: ' +
            'ssh-keygen -f keyName.pub -e -m pem > keyName.pem'
        );
        process.exit(1);
    }

    const NodeRSA = require('node-rsa');
    const key = new NodeRSA({b: 2048});//, {environment: 'browser'});

    switch (testName) {
        case 'privateKeyInbound':
            key.importKey(privateKeyInbound, 'pkcs1-private');
            break;
        case 'publicKeyInbound':
            key.importKey(publicKeyInbound, 'pkcs1-public');
            break;
        case 'generatePair':
            key.generateKeyPair();
            writeKeys(key);
            break;
    }

    let encrypted = key.encrypt(text, 'base64');
    console.log("Mensagem criptografada: \n" + encrypted);
    switch (testName) {
        case 'privateKeyInbound':
            key.importKey(publicKeyInbound, 'pkcs1-public'); //also works with private key
            break;
        case 'publicKeyInbound':
            key.importKey(privateKeyInbound, 'pkcs1-private');
            //note: this overwrites the previously imported public key with the one implicit in the new private key
            break;
        case 'generatePair':
            //uses key generated above
            break;
    }

    let decrypted;
    try {
        decrypted = key.decrypt(encrypted, 'utf8');
    } catch (e) {
        console.log(`\n${e.toString()}`);
    }

    if (decrypted == text) {
        console.log(`\nSucesso. Texto simples e descriptografado!! (${testName})`);
    } else {
        console.log(`\nErro. Texto não pode ser descriptografado com a chave fornecida - (${testName}) ==`);
    }
};

/*Na linha 80 é necessário configurar o valor da várial testName para o objetivo proposto sendo:
publicKeyInbound - Quando se quer encryptar uma mensagem utilizando a chave pública e decryptá-lá utlizando a chave privada.
privateKeyInbound - Quando se quer encryptar uma mensagem utilizando a chave privada e decryptá-lá utlizando a chave pública.
generatePair - Quando se quer gerar as chaves pública e privada.
*/
const testName = 'publicKeyInbound'; //or, publicKeyInbound, or, privateKeyInbound, or, generatePair
/*Na linha 82 é necessário configurar o valor do parâmetro da função readFileSync, com o nome do arquivo contendo a mensagem á ser encryptada*/
const text = fs.readFileSync('README').toString();
/*Na linha 84 é necessário configurar o valor do parâmetro da função readFileSync, com o nome do arquivo contendo a chave privada*/
const privateKeyInbound = fs.readFileSync('keys/yuri_priv').toString();
/*Na linha 86 é necessário configurar o valor do parâmetro da função readFileSync, com o nome do arquivo contendo a chave pública*/
const publicKeyInbound = fs.readFileSync('keys/yuri_pub.pem').toString();

runRsaDemo(testName, text, privateKeyInbound, publicKeyInbound);