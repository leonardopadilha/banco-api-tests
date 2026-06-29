require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const { login } = require('../helpers/login.js');

const API_URL = process.env.API_URL;
//const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

describe('Login', () => {
    describe('POST /login', () => {
        it('Deve retornar 200 com um token em string quando usar credenciais válidas', async () => {
            const response = await login('leonardo.padilha', '123456');

            expect(response.status).to.be.equal(200);
            expect(response.body.token).to.be.a('string');
            expect(response.body.token).to.not.be.empty;
            expect(response.body.token).to.have.length.greaterThan(0);
        });

        it('Deve retornar 401 quando a senha for incorreta', async () => {
            const response = await login('leonardo.padilha', 'senhaErrada');

            expect(response.status).to.be.equal(401);
            expect(response.body.error).to.be.equal('Usuário ou senha inválidos.');
        });

        it('Deve retornar 401 quando o usuário não existir', async () => {
            const response = await login('usuario.inexistente', '123456');

            expect(response.status).to.be.equal(401);
            expect(response.body.error).to.be.equal('Usuário ou senha inválidos.');
        });

        it('Deve retornar 401 quando usuário e senha forem incorretos', async () => {
            const response = await login('usuario.inexistente', 'senhaErrada');

            expect(response.status).to.be.equal(401);
            expect(response.body.error).to.be.equal('Usuário ou senha inválidos.');
        });

        it('Deve retornar 400 quando o username não for informado', async () => {
            const response = await login('123456');

            expect(response.status).to.be.equal(400);
            expect(response.body.error).to.be.equal('Usuário e senha são obrigatórios.');
        });

        it('Deve retornar 400 quando a senha não for informada', async () => {
            const response = await login('leonardo.padilha');

                expect(response.status).to.be.equal(400);
                expect(response.body.error).to.be.equal('Usuário e senha são obrigatórios.');
        });

        it('Deve retornar 400 quando o body for enviado vazio', async () => {
            const response = await login();

            expect(response.status).to.be.equal(400);
            expect(response.body.error).to.be.equal('Usuário e senha são obrigatórios.');
        });

        it('Deve retornar um token JWT válido com 3 segmentos separados por ponto', async () => {
            const response = await login('leonardo.padilha', '123456');

            const segments = response.body.token.split('.');
            expect(segments).to.have.length(3);
        });

        it('Deve retornar um token com os campos id e username no payload', async () => {
            const response = await login('leonardo.padilha', '123456');

            const payload = jwt.decode(response.body.token);
            expect(payload).to.have.property('id');
            expect(payload).to.have.property('username');
        });

        it('Deve retornar um token com expiração de 1 hora', async () => {
            const response = await login('leonardo.padilha', '123456');

            const payload = jwt.decode(response.body.token);
            expect(payload.exp - payload.iat).to.be.equal(3600);
        });
    });

    describe('Métodos HTTP não permitidos', () => {
        it('Deve retornar 405 para requisições GET em /login', async () => {
            const response = await request(API_URL)
                    .get('/login');

                expect(response.status).to.be.equal(405);
                expect(response.body.error).to.be.equal('Método não permitido.');
        });

        it('Deve retornar 405 para requisições PUT em /login', async () => {
            const response = await request(API_URL)
                    .put('/login')
                    .set('Content-Type', 'application/json')
                    .send({});

                expect(response.status).to.be.equal(405);
                expect(response.body.error).to.be.equal('Método não permitido.');
        });
    });
});
