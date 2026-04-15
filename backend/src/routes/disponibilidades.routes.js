import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isDocente } from '../middlewares/roles.middleware.js'
import * as dispController from '../controllers/disponibilidade.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Disponibilidades
 *   description: Agenda letiva do Docente (Horários Lives)
 */
router.use(authenticate)

/**
 * @swagger
 * /api/disponibilidades:
 *   get:
 *     summary: Ver a grelha de Slot horários abertos para marcações.
 *     tags: [Disponibilidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: docenteId
 *         schema:
 *           type: integer
 *         description: Permite o aluno filtrar por Docente.
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Matriz de disponibilidades
 *   post:
 *     summary: Submeter tempo livre do docente (Apenas Docente)
 *     tags: [Disponibilidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 format: date
 *               hora_inicio:
 *                 type: string
 *                 format: date-time
 *               hora_fim:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Horário Registado no Calendário
 *       409:
 *         description: Falhou - Tempo choca com marcação prévia
 */
router.get('/', dispController.listDisponibilidades)
router.post('/', isDocente, dispController.createDisponibilidade)

/**
 * @swagger
 * /api/disponibilidades/{id}:
 *   put:
 *     summary: Extender ou encurtar Slot
 *     tags: [Disponibilidades]
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
 *               hora_inicio:
 *                 type: string
 *                 format: date-time
 *               hora_fim:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: O Update da folha decorreu bem
 *   delete:
 *     summary: Remover um registo particular de Disponibilidade via ID
 *     tags: [Disponibilidades]
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
 *         description: Slot Desbloqueado/Removido
 */
router.put('/:id', isDocente, dispController.updateDisponibilidade)
router.delete('/:id', isDocente, dispController.deleteDisponibilidade)

export default router