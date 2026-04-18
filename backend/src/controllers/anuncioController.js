// ────────────────────────────────────────────────
// anuncioController.js  (substitui o existente)
// ────────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/** POST /api/anuncios — cria um anúncio (coordenadora) */
const createAnuncio = async (req, res) => {
    try {
        const { id_evento, id_grupo, titulo, mensagem } = req.body;
        const novo = await prisma.anuncio.create({
            data: {
                id_evento:       id_evento  ? parseInt(id_evento)  : null,
                id_grupo:        id_grupo   ? parseInt(id_grupo)   : null,
                id_coordenadora: req.user.id,
                titulo,
                mensagem,
                data_envio: new Date()
            }
        });
        res.status(201).json(novo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post announcement' });
    }
};

/** GET /api/anuncios — lista todos os anúncios (todos os roles) */
const listAnuncios = async (req, res) => {
    try {
        const anuncios = await prisma.anuncio.findMany({
            orderBy: { data_envio: 'desc' },
            include: {
                coordenadora: {
                    include: {
                        utilizador: { select: { nome: true, apelido: true } }
                    }
                },
                grupo: { select: { nome: true } },
                evento: { select: { nome: true } }
            }
        });
        res.status(200).json(anuncios);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list announcements' });
    }
};

module.exports = { createAnuncio, listAnuncios };


// ────────────────────────────────────────────────
// anuncioRoutes.js  (substitui o existente)
// ────────────────────────────────────────────────
/*
const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleCheckMiddleware');
const tokenValidation = require('../middlewares/authMiddleware');
const { createAnuncio, listAnuncios } = require('../controllers/anuncioController');

router.get('/',  tokenValidation, authorize([1, 2, 3]), listAnuncios);
router.post('/', tokenValidation, authorize([1]),       createAnuncio);

module.exports = router;
*/

// Adicionar ao server.js:
// const anuncioRoutes = require('./src/routes/anuncioRoutes');
// app.use('/api/anuncios', anuncioRoutes);