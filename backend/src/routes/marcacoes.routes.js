import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin, isAluno } from '../middleware/roles.middleware.js'
import * as marcacaoController from '../controllers/marcacao.controller.js'
const router = Router()
router.use(authenticate)
router.get('/', marcacaoController.listMarcacoes)
router.post('/', isAluno, marcacaoController.createMarcacao)
router.get('/:id', marcacaoController.getMarcacao)
router.patch('/:id/validar', isAdmin, marcacaoController.validarMarcacao)
router.patch('/:id/cancelar', isAdmin, marcacaoController.cancelarMarcacao)
router.patch('/:id/concluir', marcacaoController.concluirMarcacao)
router.patch('/:id/confirmar-presenca', isAluno, marcacaoController.confirmarPresenca)
export default router