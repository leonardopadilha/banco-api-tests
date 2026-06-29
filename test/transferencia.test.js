require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');
const { login } = require('../helpers/login.js');

const API_URL = process.env.API_URL;

describe('Transferencias', () => {
    describe('POST /transferencias', () => {

        let token;
        beforeEach(async () => {
            const response = await login('leonardo.padilha', '123456');
            token = response.body.token;
        })

        it('Deve retornar sucesso com 201 quando valor for igual ou acima de 10 reais', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 10
                });

                expect(response.status).to.be.equal(201);
                expect(response.body.message).to.be.equal('Transferência realizada com sucesso.');
        })

        it('Deve retornar falha com 422 quando valor for abaixo de 10 reais', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 5
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('O valor da transferência deve ser maior ou igual a R$10,00.');
        })
    })
})