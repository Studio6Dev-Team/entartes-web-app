// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);

app.get('/api/saudacao', (req, res) => {
  res.status(200).json({ 
    message: 'API REST Response!', 
    success: true 
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
