import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import * as notificacaoController from '../controllers/notificacao.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Notificacoes
 *   description: Caixa de alertas do teu Utilizador
 */
router.use(authenticate)

/**
 * @swagger
 * /api/notificacoes:
 *   get:
 *     summary: Vê as tuas mensagens e avisos
 *     tags: [Notificacoes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Mensagens Lidas/Não Lidas
 */
router.get('/', notificacaoController.listNotificacoes)

/**
 * @swagger
 * /api/notificacoes/{id}/lida:
 *   patch:
 *     summary: Limpa alerta (marca como recebida)
 *     tags: [Notificacoes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Confirma alteração de estado 'lida'
 */
router.patch('/:id/lida', notificacaoController.markAsRead)

export default router