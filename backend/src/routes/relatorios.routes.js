import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as relController from '../controllers/relatorio.controller.js'

const router = Router()
router.use(authenticate, isAdmin)
router.get('/sessoes', relController.getSessoesRelatorio)
router.get('/horas-docente', relController.getHorasDocente)
router.get('/alunos', relController.getAlunosRelatorio)
router.get('/exportar', relController.exportCSV)

export default router