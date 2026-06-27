const db = require('./db');

async function getContas() {
    const [result] = await db.query('SELECT id, titular, saldo, ativa FROM contas ORDER BY titular ASC');
    return result;
}

async function getContaById(id) {
    const [result] = await db.query('SELECT id, titular, saldo, ativa FROM contas WHERE id = ?', [id]);
    return result[0];
}

async function atualizarSaldo(id, valor) {
    await db.query('UPDATE contas SET saldo = saldo + ? WHERE id = ?', [valor, id]);
}

module.exports = { 
    getContas,
    getContaById, 
    atualizarSaldo 
};