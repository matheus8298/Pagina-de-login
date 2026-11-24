// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Pega o token que vem no cabeçalho (Header) da requisição
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  // Remove a palavra "Bearer " e deixa só o token
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verifica se o token é válido e não expirou
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Salva os dados do usuário na requisição
    next(); // Dá o "ok" e deixa a requisição passar para a rota
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};