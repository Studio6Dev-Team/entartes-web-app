import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import * as grupoController from '../controllers/grupo.controller.js'

const router = Router()
router.use(authenticate)
router.post('/:id/participantes', isAdmin, grupoController.addParticipanteGrupo)

export default router