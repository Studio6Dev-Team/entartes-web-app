import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isDocente } from '../middleware/roles.middleware.js'
import * as dispController from '../controllers/disponibilidade.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', dispController.listDisponibilidades)
router.post('/', isDocente, dispController.createDisponibilidade)
router.put('/:id', isDocente, dispController.updateDisponibilidade)
router.delete('/:id', isDocente, dispController.deleteDisponibilidade)

export default router