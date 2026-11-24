// src/db.js
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// O caminho para o arquivo do banco de dados continua o mesmo
const dbPath = path.resolve(__dirname, '..', 'database.db');

// Cria a conexão com o banco de dados usando o módulo nativo
const db = new DatabaseSync(dbPath);

// Executa o comando para criar a tabela se ela não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Conectado ao banco de dados SQLite (nativo).');

// Exporta a conexão para ser usada em outros arquivos
module.exports = db;