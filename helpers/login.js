const request = require('supertest');
//const { expect } = require('chai');

const API_URL = 'http://localhost:3000';

async function login(username, senha) {
    const response = await request(API_URL)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ 'username': username, 'senha': senha });

    return response
}

module.exports = { login }