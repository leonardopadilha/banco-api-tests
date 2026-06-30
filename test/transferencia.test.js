require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');
const { login } = require('../helpers/login.js');
const postTransferencias = require('../fixtures/postTransferencias.json');
const { realizarTransferencia } = require('../helpers/transferencia.js');
const { getUltimaTransferenciaId } = require('../helpers/db.js');

const API_URL = process.env.API_URL;

describe('Transferencias', () => {
    
    let token;
    before(async () => {
        const response = await login('leonardo.padilha', '123456');
        token = response.body.token;
    })

    describe('POST /transferencias', () => {
        it('Deve retornar sucesso com 201 quando valor for igual ou acima de 10 reais', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 10
                });

                expect(response.status).to.be.equal(201);
                expect(response.body.message).to.be.equal('Transferência realizada com sucesso.');
        })

        it('Deve retornar falha com 422 quando valor for abaixo de 10 reais', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 5
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('O valor da transferência deve ser maior ou igual a R$10,00.');
        })

        it('Deve retornar sucesso com 201 quando valor for igual a R$5.000,00 e token adicional for informado', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 5000,
                    token: '123456'
                });

                expect(response.status).to.be.equal(201);
                expect(response.body.message).to.be.equal('Transferência realizada com sucesso.');
        })

        it('Deve retornar falha com 401 quando valor for igual a R$5.000,00 e token adicional não for informado', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 5000
                });

                expect(response.status).to.be.equal(401);
                expect(response.body.error).to.be.equal('Autenticação necessária para transferências acima de R$5.000,00.');
        })

        it('Deve retornar falha com 404 quando conta de origem não existir', async () => {
            const conta = postTransferencias.conta_origem_inexistente;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 100
                });

                expect(response.status).to.be.equal(404);
                expect(response.body.error).to.be.equal('Conta de origem ou destino não encontrada.');
        })

        it('Deve retornar falha com 404 quando conta de destino não existir', async () => {
            const conta = postTransferencias.conta_destino_inexistente;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 100
                });

                expect(response.status).to.be.equal(404);
                expect(response.body.error).to.be.equal('Conta de origem ou destino não encontrada.');
        })

        it('Deve retornar falha com 422 quando conta de origem estiver inativa', async () => {
            // conta 3 deve estar inativa no ambiente de testes
            const conta = postTransferencias.conta_origem_inativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 100
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('Conta de origem ou destino está inativa.');
        })

        it('Deve retornar falha com 422 quando conta de destino estiver inativa', async () => {
            // conta 3 deve estar inativa no ambiente de testes
            const conta = postTransferencias.conta_destino_inativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 100
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('Conta de origem ou destino está inativa.');
        })

        it('Deve retornar falha com 422 quando saldo da conta de origem for insuficiente', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 999999
                });

                expect(response.status).to.be.equal(422);
                expect(response.body.error).to.be.equal('Saldo insuficiente para realizar a transferência.');
        })

        it('Deve retornar falha com 401 quando JWT não for informado', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 100
                });

                expect(response.status).to.be.equal(401);
                expect(response.body.error).to.be.equal('Token de autenticação não fornecido.');
        })

        it('Deve retornar falha com 403 quando o usuário junior.lima tentar criar uma transferência', async () => {
            const conta = postTransferencias.conta_ativa;
            const responseLogin = await login('junior.lima', '123456');
            const tokenJunior = responseLogin.body.token;

            const response = await request(API_URL)
                .post('/transferencias')
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenJunior}`)
                .send({
                    contaOrigem: conta.origem,
                    contaDestino: conta.destino,
                    valor: 100
                });

                expect(response.status).to.be.equal(403);
                expect(response.body.error).to.be.equal('Acesso não permitido.');
        })
    })

    describe('GET /transferencias/{id}', () => {
        it('Deve retornar sucesso com 200 e dados iguais ao registro de transferência contindo no banco de dados quando o id for válido', async () => {
            const conta = postTransferencias.conta_ativa;

            const response = await realizarTransferencia(conta, 10, token);
            expect(response.status).to.be.equal(201);

            const id = await getUltimaTransferenciaId(response.body.id);

            await request(API_URL)
                    .get(`/transferencias/${id}`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `Bearer ${token}`)
                    .expect(200)
                    .then(response => {
                        expect(response.body.id).to.be.equal(id);
                        expect(response.body.conta_origem_id).to.be.equal(conta.origem);
                        expect(response.body.conta_destino_id).to.be.equal(conta.destino);
                        expect(response.body.valor).to.be.equal(10);
                        expect(response.body.data_hora).to.be.a('string');
                    });
        })
    })
})