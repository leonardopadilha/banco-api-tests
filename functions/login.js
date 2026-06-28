const request = require('supertest');
const { expect } = require('chai');

const API_URL = 'http://localhost:3000';

async function login(username, senha) {
    const response = await request(API_URL)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ username, senha });

    expect(response.status).to.be.equal(200);
    return response.body
}

module.exports = { login }