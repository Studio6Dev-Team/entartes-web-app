import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as relController from '../controllers/relatorio.controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Relatorios
 *   description: Métricas Administrativas / Descarregamento de Estatísticas
 */
router.use(authenticate, isAdmin)

/**
 * @swagger
 * /api/relatorios/sessoes:
 *   get:
 *     summary: Consulta de Conclusões de Marcações entre datas (Apenas Admin)
 *     tags: [Relatorios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Report de Sessoes Fechadas Validado com sucesso.
 */
router.get('/sessoes', relController.getSessoesRelatorio)

/**
 * @swagger
 * /api/relatorios/horas-docente:
 *   get:
 *     summary: Somatórios de horas lecionadas para pagamento (Apenas Admin)
 *     tags: [Relatorios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Folha Resumo Horário por Docente Baseada em ID_Estado 4 ("Concluído")
 */
router.get('/horas-docente', relController.getHorasDocente)

/**
 * @swagger
 * /api/relatorios/alunos:
 *   get:
 *     summary: Consulta do volume de participações do alunado
 *     tags: [Relatorios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matriz com o tempo percorrido por Aluno.
 */
router.get('/alunos', relController.getAlunosRelatorio)

/**
 * @swagger
 * /api/relatorios/exportar:
 *   get:
 *     summary: Pede para descarregar o Relatório (Sessões) sob a forma dum *.CSV (Apenas Admin)
 *     tags: [Relatorios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Descarregamento em Progresso, Binary Attachment .CSV File em Headers.
 */
router.get('/exportar', relController.exportCSV)

export default router