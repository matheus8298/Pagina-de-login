// src/routes/authRoutes.js

const { body, validationResult } = require('express-validator');

// Função para validar CPF (a mesma lógica do front)
function isCPFValido(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  let digito1 = (resto === 10 || resto === 11) ? 0 : resto;
  if (digito1 !== parseInt(cpfLimpo.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  let digito2 = (resto === 10 || resto === 11) ? 0 : resto;
  if (digito2 !== parseInt(cpfLimpo.charAt(10))) return false;
  
  return true;
}

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Importa a conexão com o banco

const router = express.Router();

// Rota de REGISTRO (Cadastro)
router.post('/register', 
  // 1. Definindo as regras de validação
  body('nome').isLength({ min: 3 }).withMessage('O nome deve ter pelo menos 3 caracteres.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  body('cpf').custom((value) => {
    if (!isCPFValido(value)) {
      throw new Error('CPF inválido.');
    }
    return true;
  }),

  // 2. O código que roda depois da validação
  async (req, res) => {
    // Verifica se houve algum erro nas regras acima
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Retorna o primeiro erro (400 Bad Request)
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { nome, cpf, email, senha } = req.body;

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(senha, salt);

      const stmt = db.prepare('INSERT INTO users (nome, cpf, email, senha) VALUES (?, ?, ?, ?)');
      const info = stmt.run(nome, cpf, email, hashedPassword);

      res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: info.lastInsertRowid });

    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'E-mail ou CPF já cadastrado.' });
      }
      console.error(error);
      res.status(500).json({ message: 'Erro no servidor ao registrar.' });
    }
  }
);

// Rota de LOGIN
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 1. Busca o usuário pelo e-mail
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 2. Compara a senha enviada com a criptografada no banco
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Gera o token JWT (a "crachá" de acesso)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login bem-sucedido!', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
  }
});

module.exports = router;
