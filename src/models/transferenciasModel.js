const db = require('./db');

async function inserirTransferencia(contaOrigem, contaDestino, valor, autenticada) {
    await db.query(
        'INSERT INTO transferencias (conta_origem_id, conta_destino_id, valor, autenticada) VALUES (?, ?, ?, ?)',
        [contaOrigem, contaDestino, valor, autenticada]
    );
}

async function getTransferenciasPaginadas(limit, offset) {
    const [result] = await db.query(
        'SELECT transferencias.*, origem.titular AS titular_origem, destino.titular AS titular_destino FROM transferencias JOIN contas AS origem ON transferencias.conta_origem_id = origem.id JOIN contas AS destino ON transferencias.conta_destino_id = destino.id ORDER BY transferencias.id DESC LIMIT ? OFFSET ?',
        [parseInt(limit), parseInt(offset)]
    );
    return result;
}

async function getTotalTransferencias() {
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM transferencias');
    return total;
}

async function getTransferenciaById(id) {
    const [transferencia] = await db.query('SELECT * FROM transferencias WHERE id = ?', [id]);
    return transferencia[0]; 
}

async function atualizarTransferencia(id, contaOrigem, contaDestino, valor, autenticada) {
    await db.query(
        `UPDATE transferencias 
         SET conta_origem_id = ?, conta_destino_id = ?, valor = ?, autenticada = ? 
         WHERE id = ?`,
        [contaOrigem, contaDestino, valor, autenticada, id]
    );
}

async function modificarTransferencia(id, campos) {
    const camposConvertidos = {};

    for (const chave in campos) {
        if (chave === 'token') {
            continue; // ignora o campo token
        }

        switch (chave) {
            case 'contaOrigem':
                camposConvertidos['conta_origem_id'] = campos[chave];
                break;
            case 'contaDestino':
                camposConvertidos['conta_destino_id'] = campos[chave];
                break;
            default:
                camposConvertidos[chave] = campos[chave];
        }
    }

    const keys = Object.keys(camposConvertidos);
    if (keys.length === 0) return;

    const valores = keys.map(k => camposConvertidos[k]);
    const setClause = keys.map(k => `${k} = ?`).join(', ');

    await db.query(
        `UPDATE transferencias 
         SET ${setClause} 
         WHERE id = ?`,
        [...valores, id]
    );
}


async function removerTransferencia(id) {
    await db.query(
        `DELETE FROM transferencias WHERE id = ?`,
        [id]
    );
}

module.exports = { 
    inserirTransferencia, 
    getTransferenciasPaginadas, 
    getTotalTransferencias,
    getTransferenciaById,
    atualizarTransferencia,
    modificarTransferencia,
    removerTransferencia
};