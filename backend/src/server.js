// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importa o CORS
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // adicionado depois

const app = express();

// Middlewares básicos
app.use(cors()); // Permite que o front-end acesse a API
app.use(express.json()); // Permite que o Express entenda JSON (o que vem do front)

// Rota de teste
app.get('/', (req, res) => res.send('API está rodando!'));

// Conecta as rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // adicionado depois

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});