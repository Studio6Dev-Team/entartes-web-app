import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as eventoController from '../controllers/evento.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Gestão de Eventos
 */

router.use(authenticate)

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Lista todos os eventos
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Eventos
 *   post:
 *     summary: Cria um novo evento (Apenas Admin)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               data_realizacao:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Evento criado
 */
router.get('/', eventoController.listEventos)
router.post('/', isAdmin, eventoController.createEvento)

/**
 * @swagger
 * /api/eventos/{id}:
 *   get:
 *     summary: Detalhes específicos de um evento
 *     tags: [Eventos]
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
 *         description: Detalhes do Evento
 *   put:
 *     summary: Atualiza informação de um evento (Apenas Admin)
 *     tags: [Eventos]
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
 *     responses:
 *       200:
 *         description: Evento atualizado
 *   delete:
 *     summary: Apaga um evento
 *     tags: [Eventos]
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
 *         description: Evento apagado
 */
router.get('/:id', eventoController.getEvento)
router.put('/:id', isAdmin, eventoController.updateEvento)
router.delete('/:id', isAdmin, eventoController.deleteEvento)

/**
 * @swagger
 * /api/eventos/{id}/participantes:
 *   post:
 *     summary: Adiciona um participante ao evento
 *     tags: [Eventos]
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
 *         description: Participante associado com sucesso
 */
router.post('/:id/participantes', isAdmin, eventoController.addParticipante)

/**
 * @swagger
 * /api/eventos/{id}/participantes/{alunoId}:
 *   delete:
 *     summary: Remove o participante do evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participante removido do evento
 */
router.delete('/:id/participantes/:alunoId', isAdmin, eventoController.removeParticipante)
export default router