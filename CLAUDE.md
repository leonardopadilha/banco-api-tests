# banco-api — Regras de Negócio

## Autenticação

- `username` e `senha` são obrigatórios
- Credenciais inválidas retornam erro genérico (sem indicar qual campo está errado)
- Token JWT expira em 1 hora
- O sistema distingue token expirado de token inválido nas mensagens de erro
- O usuário `junior.lima` não pode criar transferências, mesmo autenticado

## Contas

- Contas possuem os atributos: titular, saldo e status (ativa/inativa)
- Não é possível criar, editar ou excluir contas pela API — são somente leitura

## Transferências

- Valor mínimo: R$ 10,00 (abaixo disso a transferência é rejeitada)
- Transferências com valor >= R$ 5.000,00 exigem autenticação adicional
- Conta de origem e destino devem existir
- Conta de origem e destino devem estar ativas
- Conta de origem deve ter saldo suficiente
- Toda transferência registra se foi autenticada ou não
- Todas as operações de transferência exigem JWT válido
