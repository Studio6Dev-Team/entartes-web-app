const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleCheckMiddleware');
const tokenValidation = require('../middlewares/authMiddleware');
const { createAnuncio, listAnuncios } = require('../controllers/anuncioController');

/**
 * @swagger
 * /api/anuncios:
 *   get:
 *     summary: Lista todos os anúncios
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de anúncios
 *   post:
 *     summary: Cria um novo anúncio (coordenadora)
 *     tags: [Anúncios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               mensagem:
 *                 type: string
 *               id_grupo:
 *                 type: integer
 *               id_evento:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Anúncio criado
 */

router.get('/',  tokenValidation, authorize([1, 2, 3]), listAnuncios);
router.post('/', tokenValidation, authorize([1]),       createAnuncio);

module.exports = router;