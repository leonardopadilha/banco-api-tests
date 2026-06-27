const request = require('supertest');
const { expect } = require('chai');

const API_URL = 'http://localhost:3000';

describe('Login', () => {
    describe('POST /login', () => {
        it('Deve retornar 200 com um token em string quando usar credenciais inválidas', async () => {
            const response = await request(API_URL)
                    .post('/login')
                    .set('Content-Type', 'application/json')
                    .send({'username': 'leonardo.padilha', 'senha': '123456'});

                expect(response.status).to.be.equal(200);
                expect(response.body.token).to.be.a('string');
                expect(response.body.token).to.not.be.empty;
                expect(response.body.token).to.have.length.greaterThan(0);
        })
    })
})