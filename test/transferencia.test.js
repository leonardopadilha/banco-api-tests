require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');
const { login } = require('../helpers/login.js');

const API_URL = process.env.API_URL;

describe('Transferencias', () => {
    describe('POST /transferencias', () => {

        let token;
        before(async () => {
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

        it('Deve retornar sucesso com 201 quando valor for igual a R$5.000,00 e token adicional for informado', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 5000,
                    token: '123456'
                });

                expect(response.status).to.be.equal(201);
                expect(response.body.message).to.be.equal('Transferência realizada com sucesso.');
        })

        it('Deve retornar falha com 401 quando valor for igual a R$5.000,00 e token adicional não for informado', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 5000
                });

                expect(response.status).to.be.equal(401);
                expect(response.body.error).to.be.equal('Autenticação necessária para transferências acima de R$5.000,00.');
        })

        it('Deve retornar falha com 404 quando conta de origem não existir', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 9999,
                    contaDestino: 2,
                    valor: 100
                });

                expect(response.status).to.be.equal(404);
                expect(response.body.error).to.be.equal('Conta de origem ou destino não encontrada.');
        })

        it('Deve retornar falha com 404 quando conta de destino não existir', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 9999,
                    valor: 100
                });

                expect(response.status).to.be.equal(404);
                expect(response.body.error).to.be.equal('Conta de origem ou destino não encontrada.');
        })

        it('Deve retornar falha com 422 quando conta de origem estiver inativa', async () => {
            // conta 3 deve estar inativa no ambiente de testes
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 3,
                    contaDestino: 2,
                    valor: 100
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('Conta de origem ou destino está inativa.');
        })

        it('Deve retornar falha com 422 quando conta de destino estiver inativa', async () => {
            // conta 3 deve estar inativa no ambiente de testes
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 3,
                    valor: 100
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('Conta de origem ou destino está inativa.');
        })

        it('Deve retornar falha com 422 quando saldo da conta de origem for insuficiente', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 999999
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('Saldo insuficiente para realizar a transferência.');
        })

        it('Deve retornar falha com 401 quando JWT não for informado', async () => {
            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 100
                });

                expect(response.status).to.be.equal(401);
                expect(response.body.error).to.be.equal('Token de autenticação não fornecido.');
        })

        it('Deve retornar falha com 403 quando o usuário junior.lima tentar criar uma transferência', async () => {
            const responseLogin = await login('junior.lima', '123456');
            const tokenJunior = responseLogin.body.token;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenJunior}`)
                .send({
                    contaOrigem: 1,
                    contaDestino: 2,
                    valor: 100
                });

                expect(response.status).to.be.equal(403);
                expect(response.body.error).to.be.equal('Acesso não permitido.');
        })
    })
})