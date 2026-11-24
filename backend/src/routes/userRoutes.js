// src/routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplica o "porteiro" em TODAS as rotas deste arquivo
router.use(authMiddleware);

// READ (Listar todos os usuários)
router.get('/', (req, res) => {
  try {
    // Buscamos todos, mas NUNCA devolvemos a senha (por segurança)
    const stmt = db.prepare('SELECT id, nome, cpf, email, criado_em FROM users');
    const users = stmt.all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// READ (Buscar um usuário pelo ID)
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, nome, cpf, email, criado_em FROM users WHERE id = ?');
    const user = stmt.get(req.params.id);
    
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
});

// UPDATE (Atualizar dados do usuário)
router.put('/:id', async (req, res) => {
  const { nome, email, senha } = req.body;
  
  if (!nome && !email && !senha) {
    return res.status(400).json({ message: 'Nenhum dado para atualizar.' });
  }

  try {
    // 1. Busca o usuário atual para não apagar dados que não foram enviados
    const stmtBusca = db.prepare('SELECT * FROM users WHERE id = ?');
    const userAtual = stmtBusca.get(req.params.id);
    if (!userAtual) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // 2. Prepara os novos dados (se não enviou, mantém o antigo)
    const novoNome = nome || userAtual.nome;
    const novoEmail = email || userAtual.email;
    let novaSenha = userAtual.senha;

    // 3. Se enviou nova senha, criptografa ela
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      novaSenha = await bcrypt.hash(senha, salt);
    }

    // 4. Salva no banco
    const stmtUpdate = db.prepare('UPDATE users SET nome = ?, email = ?, senha = ? WHERE id = ?');
    stmtUpdate.run(novoNome, novoEmail, novaSenha, req.params.id);

    res.json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
});

// DELETE (Deletar usuário)
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(req.params.id);

    if (info.changes === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
});

module.exports = router;