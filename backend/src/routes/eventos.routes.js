import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/roles.middleware.js'
import * as eventoController from '../controllers/evento.controller.js'
const router = Router()
router.use(authenticate)
router.get('/', eventoController.listEventos)
router.get('/:id', eventoController.getEvento)
router.post('/', isAdmin, eventoController.createEvento)
router.put('/:id', isAdmin, eventoController.updateEvento)
router.delete('/:id', isAdmin, eventoController.deleteEvento)
router.post('/:id/participantes', isAdmin, eventoController.addParticipante)
router.delete('/:id/participantes/:alunoId', isAdmin, eventoController.removeParticipante)
export default router