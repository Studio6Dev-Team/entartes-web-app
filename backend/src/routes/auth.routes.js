import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as authController from '../controllers/auth.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de Autenticação
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Faz login na aplicação
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login com sucesso (devolve token e role)
 *       401:
 *         description: Credenciais incorretas
 *       403:
 *         description: Conta suspensa
 */
router.post('/login', authController.login)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtém os dados do utilizador atualmente autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do utilizador (id, username, estado, tipo_utilizador)
 *       401:
 *         description: Não autorizado (token em falta ou inválido)
 *       404:
 *         description: Utilizador não encontrado
 */
router.get('/me', authenticate, authController.getMe)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Faz logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout com sucesso
 */
router.post('/logout', authenticate, (req, res) => res.json({ message: 'Logged out' }))

export default router