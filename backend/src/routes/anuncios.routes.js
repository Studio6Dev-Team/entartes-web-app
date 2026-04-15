import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as anuncioController from '../controllers/anuncio.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Anuncios
 *   description: Gerador de alertas e quadros de anúncios
 */
router.use(authenticate, isAdmin)

/**
 * @swagger
 * /api/anuncios:
 *   post:
 *     summary: Cria um Anúncio Direcionado (Apenas Admin)
 *     tags: [Anuncios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_evento:
 *                 type: integer
 *               id_grupo:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               mensagem:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensagem de anúncio disparada / registada
 */
router.post('/', anuncioController.createAnuncio)

export default router