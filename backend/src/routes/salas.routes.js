import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as salaController from '../controllers/sala.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Salas
 *   description: Gestão das salas do sistema
 */
router.use(authenticate)

/**
 * @swagger
 * /api/salas:
 *   get:
 *     summary: Obtém uma lista de todas as salas
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salas devolvida com sucesso
 *       401:
 *         description: Não Autorizado
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/', salaController.listSalas)

/**
 * @swagger
 * /api/salas/{id}:
 *   delete:
 *     summary: Apaga uma sala pelo seu ID (Apenas Admin)
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico da sala a remover
 *     responses:
 *       200:
 *         description: Sala removida com sucesso
 *       401:
 *         description: Requer token Bearer
 *       403:
 *         description: Acesso negado (precisas de permissão de admin)
 *       500:
 *         description: Conflito (Sala possivelmente atribuída a marcações)
 */
router.delete('/:id', isAdmin, salaController.deleteSala)

export default router