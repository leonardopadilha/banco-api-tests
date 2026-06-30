const request = require('supertest');

const API_URL = process.env.API_URL;

async function realizarTransferencia(conta, valor, token) {
    const response = await request(API_URL)
        .post('/transferencias')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({
            contaOrigem: conta.origem,
            contaDestino: conta.destino,
            valor: valor
        });

    return response;
}

module.exports = { realizarTransferencia };