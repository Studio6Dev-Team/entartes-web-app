import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/roles.middleware.js'
import * as salaController from '../controllers/sala.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', salaController.listSalas)
router.delete('/:id', isAdmin, salaController.deleteSala)

export default router