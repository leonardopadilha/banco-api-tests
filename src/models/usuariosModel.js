const db = require('./db');

async function getUsuarioByCredenciais(username, senha) {
    const [result] = await db.query(
        'SELECT * FROM usuarios WHERE username = ? AND senha = ?',
        [username, senha]
    );
    return result[0];
}

module.exports = { 
    getUsuarioByCredenciais 
};