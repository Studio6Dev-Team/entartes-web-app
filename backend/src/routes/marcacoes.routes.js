import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin, isAluno } from '../middlewares/roles.middleware.js'
import * as marcacaoController from '../controllers/marcacao.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Marcacoes
 *   description: Gestão do Percurso e Sessões
 */
router.use(authenticate)

/**
 * @swagger
 * /api/marcacoes:
 *   get:
 *     summary: Lista marcações baseadas no teu perfil
 *     tags: [Marcacoes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Marcações
 *   post:
 *     summary: Cria uma nova marcação (Apenas Aluno)
 *     tags: [Marcacoes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Marcação criada e estado histórico inicializado
 */
router.get('/', marcacaoController.listMarcacoes)
router.post('/', isAluno, marcacaoController.createMarcacao)

/**
 * @swagger
 * /api/marcacoes/{id}:
 *   get:
 *     summary: Mostra os detalhes completos de uma marcação
 *     tags: [Marcacoes]
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
 *         description: Detalhes da Marcação
 */
router.get('/:id', marcacaoController.getMarcacao)

/**
 * @swagger
 * /api/marcacoes/{id}/validar:
 *   patch:
 *     summary: Valida a marcação associando a uma sala (Apenas Admin)
 *     tags: [Marcacoes]
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
 *               id_sala:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Marcação Validada
 */
router.patch('/:id/validar', isAdmin, marcacaoController.validarMarcacao)

/**
 * @swagger
 * /api/marcacoes/{id}/cancelar:
 *   patch:
 *     summary: Cancela marcação (Apenas Admin)
 *     tags: [Marcacoes]
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
 *         description: Marcação movida para o estado Cancelado
 */
router.patch('/:id/cancelar', isAdmin, marcacaoController.cancelarMarcacao)

/**
 * @swagger
 * /api/marcacoes/{id}/concluir:
 *   patch:
 *     summary: Submeter confirmação de conclusão da marcação
 *     tags: [Marcacoes]
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
 *               confirmou:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status do match de dupla validação (docente + aluno) atualizado
 */
router.patch('/:id/concluir', marcacaoController.concluirMarcacao)

/**
 * @swagger
 * /api/marcacoes/{id}/confirmar-presenca:
 *   patch:
 *     summary: Aluno submete confirmação presencial da sessão
 *     tags: [Marcacoes]
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
 *         description: Presença registada
 */
router.patch('/:id/confirmar-presenca', isAluno, marcacaoController.confirmarPresenca)
export default router