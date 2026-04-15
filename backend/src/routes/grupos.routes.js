import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as grupoController from '../controllers/grupo.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Grupos
 *   description: Enlaces dos Grupos (Bands / Formações)
 */
router.use(authenticate)

/**
 * @swagger
 * /api/grupos/{id}/participantes:
 *   post:
 *     summary: Inserir e Vincular alunos a Formações
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_aluno:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Grupo Preenchido (vinculo associado)
 */
router.post('/:id/participantes', isAdmin, grupoController.addParticipanteGrupo)

export default router